package org.nexus.napbackend.scoring;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import org.nexus.napbackend.dto.QualificationResult;
import org.nexus.napbackend.model.AdmissionDecision;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.repository.AdmissionDecisionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Single entry point for admission scoring.
 *
 * <p>Owns the policy resolution, the model call, the decision record, and the
 * interaction with the legacy engine, so callers do not need to know which mode
 * is active.
 */
@Service
public class ScoringService {

    private static final Logger log = LoggerFactory.getLogger(ScoringService.class);

    private final QualificationModel model;
    private final ScoringPolicyFactory policyFactory;
    private final LegacyScoringEngine legacyEngine;
    private final AdmissionDecisionRepository decisionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ScoringMode mode;

    public ScoringService(QualificationModel model,
                          ScoringPolicyFactory policyFactory,
                          LegacyScoringEngine legacyEngine,
                          AdmissionDecisionRepository decisionRepository,
                          @Value("${nap.admission.scoring.mode:LEGACY}") String mode) {
        this.model = model;
        this.policyFactory = policyFactory;
        this.legacyEngine = legacyEngine;
        this.decisionRepository = decisionRepository;
        this.mode = ScoringMode.from(mode);
    }

    public ScoringMode mode() {
        return mode;
    }

    public ModelVersion version() {
        return model.version();
    }

    public ScoringPolicy policyFor(Program programme, AdmissionScheme scheme) {
        return policyFactory.resolve(programme, scheme);
    }

    public QualificationEvaluation evaluate(Application application,
                                            Program programme,
                                            ScoringPolicy policy) {
        return model.evaluate(new ScoringRequest(
                application, programme, policy, programme == null ? null : programme.getCutoffIndex()));
    }

    /**
     * The result that should be shown to an officer and stored in
     * {@code applications.qualification_results}, chosen by the active mode.
     *
     * <p>This is the method callers in the application workflow should use. It is
     * the only place the mode is allowed to change what a human sees:
     *
     * <ul>
     *   <li>{@code LEGACY} and {@code SHADOW} both return the legacy result, so
     *       switching to shadow mode is invisible to applicants and officers.</li>
     *   <li>{@code ENFORCE} returns the new engine's outcome projected onto the
     *       legacy wire shape.</li>
     * </ul>
     *
     * <p>The new engine is wrapped in a guard in every mode. A bug or an
     * unexpected payload in the new engine must not be able to break a decision
     * in the mode that is supposed to be the untouched one.
     */
    public QualificationResult qualificationResult(Application application,
                                                   Program programme,
                                                   AdmissionScheme scheme) {
        LegacyScoringEngine.LegacyEvaluation legacy = legacyEngine.evaluateWithOutcome(application, programme);
        if (mode != ScoringMode.ENFORCE) {
            return legacy.result();
        }
        try {
            ScoringPolicy policy = policyFor(programme, scheme);
            return project(model.evaluate(new ScoringRequest(
                    application, programme, policy, programme.getCutoffIndex())), legacy.result());
        } catch (Exception e) {
            log.error("New engine failed for application {} programme {} under ENFORCE; "
                            + "falling back to the legacy result so the applicant still gets a decision",
                    application.getId(), programme.getProgramCode(), e);
            return legacy.result();
        }
    }

    /**
     * The outcome the active engine reaches for one programme, guarded.
     *
     * <p>Separate from {@link #qualificationResult} because that method can only
     * express ADMIT or REJECT on the wire, and a caller deciding whether to
     * auto-assign a place needs to tell REVIEW apart from ADMIT. Auto-assigning
     * a place is a decision of record, so it must not be driven off a lossy
     * projection of the outcome.
     */
    public AdmissionOutcome outcomeOf(Application application,
                                      Program programme,
                                      AdmissionScheme scheme) {
        if (mode != ScoringMode.ENFORCE) {
            return legacyEngine.evaluateWithOutcome(application, programme).outcome();
        }
        try {
            return model.evaluate(new ScoringRequest(
                    application, programme, policyFor(programme, scheme),
                    programme.getCutoffIndex())).outcome();
        } catch (Exception e) {
            log.error("New engine failed for application {} programme {} under ENFORCE; "
                            + "falling back to the legacy outcome",
                    application.getId(), programme.getProgramCode(), e);
            return legacyEngine.evaluateWithOutcome(application, programme).outcome();
        }
    }

    /**
     * Renders a new-engine evaluation in the legacy wire shape.
     *
     * <p>The old schema has no field for an admission index, a gate list or a
     * review routing decision, so {@code qualified} is the only place the new
     * outcome can be expressed: admitted and reviewed applicants both count as
     * qualified, because "needs a human" must never be rendered to an applicant
     * as a rejection. The index and reasons travel alongside in
     * {@code admission_decisions}.
     */
    private QualificationResult project(QualificationEvaluation evaluation, QualificationResult legacy) {
        boolean qualified = evaluation.outcome() != AdmissionOutcome.REJECT;
        return new QualificationResult(
                evaluation.programmeCode(),
                evaluation.programmeName(),
                qualified,
                evaluation.admissionIndex(),
                evaluation.admissionIndex(),
                false,
                programmeCutoff(evaluation),
                evaluation.oLevelIndex(),
                evaluation.aLevelIndex(),
                legacy.breakdown(),
                String.join(" ", evaluation.reasons())
        );
    }

    private static double programmeCutoff(QualificationEvaluation evaluation) {
        Double cutoff = evaluation.legacyCutoffScore();
        return cutoff == null ? 0.0 : cutoff;
    }

    /**
     * Evaluates every programme the applicant chose and records one decision per
     * programme.
     *
     * <p>Recording happens in every mode, including {@code LEGACY}. That looks
     * like it widens the blast radius of the new engine, but it does not:
     * {@code admission_decisions} is a new table, and a failure anywhere in the
     * new path is caught and logged rather than propagated. The payoff is that
     * the calibration set starts filling on day one, and the shadow run later
     * needs no second backfill. Recording only the shadowed or enforced
     * applicants would bias the set towards applicants the new engine already
     * likes, which is precisely the population whose behaviour is unknown.
     */
    @Transactional
    public List<QualificationEvaluation> evaluateAndRecord(Application application,
                                                            List<Program> programmes,
                                                            AdmissionScheme scheme) {
        List<QualificationEvaluation> evaluations = new ArrayList<>();

        for (Program programme : programmes) {
            if (!matchesChoice(application, programme)) {
                continue;
            }
            LegacyScoringEngine.LegacyEvaluation legacy = legacyEngine.evaluateWithOutcome(application, programme);
            try {
                ScoringPolicy programmePolicy = policyFor(programme, scheme);
                QualificationEvaluation evaluation = model.evaluate(new ScoringRequest(
                        application, programme, programmePolicy, programme.getCutoffIndex()));
                evaluations.add(evaluation);
                record(application, programme, evaluation, legacy.outcome());
            } catch (Exception e) {
                log.error("Scoring failed for application {} programme {}; the legacy decision still stands",
                        application.getId(), programme.getProgramCode(), e);
            }
        }
        return List.copyOf(evaluations);
    }

    /**
     * Writes the decision of record.
     *
     * <p>{@code admission_decisions.outcome} always describes what actually
     * happened to the applicant: the new engine's outcome only when enforcing,
     * and the legacy outcome otherwise. The new engine's opinion is never
     * discarded, though, because {@code admissionIndex}, the gates and the data
     * quality flags are stored alongside, so a shadow run can be replayed later
     * without re-scoring anybody.
     */
    private void record(Application application, Program programme,
                        QualificationEvaluation evaluation, AdmissionOutcome legacyOutcome) {
        AdmissionDecision decision = new AdmissionDecision();
        decision.setTenantId(application.getTenantId());
        decision.setApplicationId(application.getId());
        decision.setProgrammeCode(evaluation.programmeCode());
        decision.setProgrammeId(programme.getId());
        decision.setAdmissionIndex(evaluation.admissionIndex());
        decision.setOLevelIndex(evaluation.oLevelIndex());
        decision.setALevelIndex(evaluation.aLevelIndex());
        decision.setCutoffIndex(programme.getCutoffIndex());
        decision.setLegacyTotalScore(evaluation.legacyTotalScore());
        decision.setCriteriaJson(toJson(evaluation.criteria()));
        decision.setGatesJson(toJson(evaluation.gates()));
        decision.setDataQuality(evaluation.dataQuality().toString());
        decision.setModelVersion(evaluation.modelVersion().version());
        decision.setScoringMode(mode.name());
        decision.setSubmittedAt(application.getSubmittedAt());
        decision.setOutcome(mode == ScoringMode.ENFORCE
                ? evaluation.outcome().name()
                : legacyOutcome.name());

        try {
            decisionRepository.save(decision);
        } catch (Exception e) {
            // A failure to record must never prevent a decision from being
            // returned to the officer, but it must be visible.
            log.error("Failed to record admission decision for application {} programme {}",
                    application.getId(), programme.getProgramCode(), e);
        }
    }

    /** Attaches the officer's recorded decision so overrides are analysable later. */
    @Transactional
    public void recordHumanOutcome(Long applicationId, String humanOutcome) {
        List<AdmissionDecision> decisions = decisionRepository.findByApplicationIdOrderByIdAsc(applicationId);
        if (decisions.isEmpty() || humanOutcome == null || humanOutcome.isBlank()) {
            return;
        }
        String normalised = humanOutcome.trim().toUpperCase();
        for (AdmissionDecision decision : decisions) {
            decision.setHumanOutcome(normalised);
            decision.setOverrodeEngine(!normalised.equals(decision.getOutcome()));
        }
        decisionRepository.saveAll(decisions);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "[]";
        }
    }

    private static boolean matchesChoice(Application application, Program programme) {
        if (programme == null || programme.getProgramCode() == null) {
            return false;
        }
        String[] choices = {
                application.getProgramChoice1(), application.getProgramChoice2(),
                application.getProgramChoice3(), application.getProgramChoice4()
        };
        for (String choice : choices) {
            if (choice == null || choice.isBlank()) {
                continue;
            }
            if (programme.getProgramCode().equalsIgnoreCase(choice)
                    || (programme.getProgramName() != null && programme.getProgramName().equalsIgnoreCase(choice))) {
                return true;
            }
        }
        return false;
    }
}
