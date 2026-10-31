package org.nexus.napbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import org.nexus.napbackend.dto.QualificationResult;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.scoring.AdmissionOutcome;
import org.nexus.napbackend.scoring.QualificationEvaluation;
import org.nexus.napbackend.scoring.ScoringMode;
import org.nexus.napbackend.scoring.ScoringService;
import org.springframework.stereotype.Service;

/**
 * Adapter that keeps the pre-existing public surface working while the scoring
 * itself lives in the {@code scoring} package.
 *
 * <p>This class no longer decides anything. Three behaviours of the original
 * implementation were defective and have been replaced by
 * {@link ScoringService}:
 *
 * <ul>
 *   <li>The 1.5 point female applicant bonus. Gender is not read by the new
 *       scoring engine at all, and must not become a learned coefficient later
 *       either.</li>
 *   <li>{@code catch (Exception) { return 0; }} on subject parsing, which turned a
 *       malformed record into a score of zero and a confident "below cutoff"
 *       rejection. Unreadable input now forces a review.</li>
 *   <li>{@code adjustedScore >= cutoffScore} against a cutoff that defaults to
 *       0.0, which admitted every applicant to any programme whose threshold had
 *       not been set. A missing threshold now means review.</li>
 * </ul>
 *
 * <p>Which of those fixes an applicant actually sees is decided by
 * {@link ScoringService} according to the configured mode. Until the committee
 * agrees the new thresholds, the deployment stays in {@code LEGACY} and this
 * adapter returns the original arithmetic, so the fixes are available but inert.
 */
@Service
public class WeightingService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ScoringService scoringService;

    public WeightingService(ScoringService scoringService) {
        this.scoringService = scoringService;
    }

    /**
     * Produces the legacy wire shape for one programme, delegating the mode
     * decision to {@link ScoringService#qualificationResult}.
     */
    public QualificationResult evaluateQualification(Application app, Program programme) {
        return evaluateQualification(app, programme, null);
    }

    /** As above, with the applicant's scheme so scheme-level policy can apply. */
    public QualificationResult evaluateQualification(Application app, Program programme, AdmissionScheme scheme) {
        if (programme == null) {
            return null;
        }
        return scoringService.qualificationResult(app, programme, scheme);
    }

    public String evaluateAllChoices(Application app, List<Program> programmes) {
        return evaluateAllChoices(app, programmes, null);
    }

    public String evaluateAllChoices(Application app, List<Program> programmes, AdmissionScheme scheme) {
        List<QualificationResult> results = new ArrayList<>();
        for (Program programme : programmes) {
            QualificationResult result = evaluateQualification(app, programme, scheme);
            if (result != null) {
                results.add(result);
            }
        }
        try {
            return objectMapper.writeValueAsString(results);
        } catch (Exception e) {
            return "[]";
        }
    }

    /**
     * Returns the first chosen programme the active engine admitted, or null when
     * none qualifies.
     *
     * <p>Auto-assignment follows the mode too. A legacy run auto-assigns on the
     * old threshold, because that is what it always did. An enforcing run only
     * auto-assigns a real {@link AdmissionOutcome#ADMIT}, and deliberately leaves
     * an applicant needing review unassigned, because an assignment is a decision
     * of record and must be made by a person.
     */
    public String findAssignedProgramme(Application app, List<Program> programmes) {
        return findAssignedProgramme(app, programmes, null);
    }

    public String findAssignedProgramme(Application app, List<Program> programmes, AdmissionScheme scheme) {
        String[] choices = {
                app.getProgramChoice1(), app.getProgramChoice2(),
                app.getProgramChoice3(), app.getProgramChoice4()
        };
        for (String choice : choices) {
            if (choice == null || choice.isBlank()) {
                continue;
            }
            for (Program programme : programmes) {
                if (programme == null || programme.getProgramCode() == null) {
                    continue;
                }
                boolean matches = programme.getProgramCode().equalsIgnoreCase(choice)
                        || (programme.getProgramName() != null
                            && programme.getProgramName().equalsIgnoreCase(choice));
                if (matches && isAutoAssignable(app, programme, scheme)) {
                    return programme.getProgramCode();
                }
            }
        }
        return null;
    }

    private boolean isAutoAssignable(Application app, Program programme, AdmissionScheme scheme) {
        if (scoringService.mode() == ScoringMode.ENFORCE) {
            return scoringService.outcomeOf(app, programme, scheme) == AdmissionOutcome.ADMIT;
        }
        return evaluateQualification(app, programme, scheme).qualified();
    }
}
