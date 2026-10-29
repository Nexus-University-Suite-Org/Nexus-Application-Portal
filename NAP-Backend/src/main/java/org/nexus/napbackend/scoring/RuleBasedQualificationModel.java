package org.nexus.napbackend.scoring;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;
import org.springframework.stereotype.Component;

/**
 * Deterministic, fully decomposable admission scoring.
 *
 * <p>Replaces the previous single comparison, {@code adjustedScore >= cutoffScore},
 * which combined three problems: the O-level and A-level contributions sat on
 * incomparable scales, a missing cutoff silently admitted everyone, and any input
 * that failed to parse became a score of zero and a confident rejection.
 *
 * <p>The output is a 0-100 admission index built from a 0-6 per-subject grade
 * scale, so O-level and A-level are commensurable and the index is comparable
 * across programmes. Every point is attributable to a {@link CriterionScore}.
 *
 * <p>No applicant gender is read anywhere in this class, deliberately. Gender must
 * not be a predictor or a scoring input.
 */
@Component
public class RuleBasedQualificationModel implements QualificationModel {

    private final SubjectReader subjectReader;

    public RuleBasedQualificationModel(SubjectReader subjectReader) {
        this.subjectReader = subjectReader;
    }

    @Override
    public ModelVersion version() {
        return ModelVersion.current();
    }

    @Override
    public QualificationEvaluation evaluate(ScoringRequest request) {
        Application application = request.application();
        Program programme = request.programme();
        ScoringPolicy policy = request.policy();

        SubjectParseResult oLevel = subjectReader.readOLevel(application);
        SubjectParseResult aLevel = subjectReader.readALevel(application);

        Set<DataQuality.Flag> flags = EnumSet.noneOf(DataQuality.Flag.class);
        flags.addAll(oLevel.dataQuality().flags());
        flags.addAll(aLevel.dataQuality().flags());
        if (policy.passThresholdPoints().isEmpty()) {
            flags.add(DataQuality.Flag.INVALID_PASS_THRESHOLD);
        }
        DataQuality dataQuality = new DataQuality(flags);

        List<CriterionScore> criteria = new ArrayList<>();
        OLevelComponent o = scoreOLevel(oLevel, policy, criteria);
        ALevelComponent a = scoreALevel(aLevel, programme, criteria);
        double index = combine(o, a, policy);

        List<GateResult> gates = buildGates(request, dataQuality, o, a);
        AdmissionOutcome outcome = provisionalOutcome(index, request.cutoffIndex());
        for (GateResult gate : gates) {
            outcome = gate.applyTo(outcome);
        }

        return new QualificationEvaluation(
                programme.getProgramCode(),
                programme.getProgramName(),
                outcome,
                round2(index),
                round2(o.index()),
                round2(a.index()),
                round2(o.rawPoints() + a.rawPoints()),
                programme.getCutoffScore() == null ? 0 : round2(programme.getCutoffScore()),
                List.copyOf(criteria),
                List.copyOf(gates),
                dataQuality,
                version(),
                buildReasons(request, o, a, index, gates, outcome));
    }

    private AdmissionOutcome provisionalOutcome(double index, Double cutoffIndex) {
        if (cutoffIndex == null || cutoffIndex <= 0) {
            return AdmissionOutcome.REVIEW;
        }
        return index >= cutoffIndex ? AdmissionOutcome.ADMIT : AdmissionOutcome.REJECT;
    }

    // ---------------------------------------------------------------- O-level

    private record OLevelComponent(double index, double rawPoints, int passes, int counted, boolean supplied) {
    }

    private OLevelComponent scoreOLevel(SubjectParseResult result, ScoringPolicy policy, List<CriterionScore> criteria) {
        List<SubjectGrade> recognised = result.subjects().stream()
                .filter(SubjectGrade::recognised)
                .sorted(Comparator.comparingDouble(SubjectGrade::points).reversed())
                .toList();

        if (recognised.isEmpty()) {
            return new OLevelComponent(0, 0, 0, 0, result.isUsable() && result.size() > 0);
        }

        double passMark = policy.passThresholdPoints().orElse(0);
        int passes = (int) recognised.stream().filter(s -> s.points() >= passMark).count();

        List<SubjectGrade> best = recognised.stream()
                .limit(Math.max(1, policy.bestOfOLevelSubjects()))
                .toList();
        double raw = best.stream().mapToDouble(SubjectGrade::points).sum();
        double max = best.size() * GradeScale.MAX_SUBJECT_POINTS;
        double index = max > 0 ? (raw / max) * 100 : 0;

        for (SubjectGrade subject : best) {
            criteria.add(new CriterionScore(
                    "O_LEVEL_" + subject.subject().toUpperCase().replaceAll("[^A-Z0-9]+", "_"),
                    "O-level " + subject.subject(),
                    GradeScale.MAX_SUBJECT_POINTS,
                    subject.points(),
                    subject.points(),
                    gradeDescription(subject)));
        }
        criteria.add(new CriterionScore(
                "O_LEVEL_TOTAL", "O-level aggregate", max, raw, raw,
                "Best " + best.size() + " of " + recognised.size() + " subjects, "
                        + passes + " at or above " + policy.passThresholdGrade()));

        return new OLevelComponent(index, raw, passes, best.size(), true);
    }

    // ---------------------------------------------------------------- A-level

    private record ALevelComponent(double index, double rawPoints, int counted, boolean supplied) {
    }

    private ALevelComponent scoreALevel(SubjectParseResult result, Program programme, List<CriterionScore> criteria) {
        List<SubjectGrade> recognised = result.subjects().stream()
                .filter(SubjectGrade::recognised)
                .toList();

        if (recognised.isEmpty()) {
            return new ALevelComponent(0, 0, 0, result.isUsable() && result.size() > 0);
        }

        double weighted = 0;
        double maxWeighted = 0;
        for (SubjectGrade subject : recognised) {
            String category = subjectReader.categorise(subject.subject(), programme);
            double categoryWeight = categoryWeight(category);
            weighted += subject.points() * categoryWeight;
            maxWeighted += GradeScale.MAX_SUBJECT_POINTS * categoryWeight;
            criteria.add(new CriterionScore(
                    "A_LEVEL_" + subject.subject().toUpperCase().replaceAll("[^A-Z0-9]+", "_"),
                    "A-level " + subject.subject(),
                    GradeScale.MAX_SUBJECT_POINTS * categoryWeight,
                    subject.points(),
                    subject.points() * categoryWeight,
                    gradeDescription(subject) + ", " + category + " (x" + trim(categoryWeight) + ")"));
        }
        double index = maxWeighted > 0 ? (weighted / maxWeighted) * 100 : 0;
        return new ALevelComponent(index, weighted, recognised.size(), true);
    }

    private static double categoryWeight(String category) {
        return switch (category) {
            case "Essential" -> 3.0;
            case "Relevant" -> 2.0;
            case "Desirable" -> 1.0;
            default -> 0.5;
        };
    }

    // ---------------------------------------------------------------- combine

    /**
     * Blends the two components. Weights are renormalised over whichever
     * components are actually present, so an applicant with no A-level results is
     * scored on O-level alone instead of being silently penalised 60 percent of
     * the index for a qualification they never sat.
     */
    private double combine(OLevelComponent o, ALevelComponent a, ScoringPolicy policy) {
        double oWeight = o.supplied() ? policy.oLevelWeight() : 0;
        double aWeight = a.supplied() ? policy.aLevelWeight() : 0;
        double total = oWeight + aWeight;
        if (total <= 0) {
            return 0;
        }
        return (o.index() * oWeight + a.index() * aWeight) / total;
    }

    // ------------------------------------------------------------------ gates

    private List<GateResult> buildGates(ScoringRequest request,
                                        DataQuality dataQuality,
                                        OLevelComponent o,
                                        ALevelComponent a) {
        Program programme = request.programme();
        ScoringPolicy policy = request.policy();
        AdmissionOutcome onFailure = policy.gateFailureOutcome();
        List<GateResult> gates = new ArrayList<>();

        Double cutoffIndex = request.cutoffIndex();
        if (cutoffIndex == null || cutoffIndex <= 0) {
            gates.add(GateResult.fail("THRESHOLD_NOT_CONFIGURED",
                    "Programme admission threshold is configured",
                    GateResult.Category.THRESHOLD, AdmissionOutcome.REVIEW,
                    "No admission threshold is set for this programme, so no applicant can be admitted automatically."));
        } else {
            gates.add(GateResult.pass("THRESHOLD_NOT_CONFIGURED",
                    "Programme admission threshold is configured",
                    GateResult.Category.THRESHOLD,
                    "Threshold set at " + trim(cutoffIndex) + " on the 0-100 admission index."));
        }

        if (dataQuality.blocksAutomaticDecision()) {
            gates.add(GateResult.fail("DATA_NOT_READABLE",
                    "Submitted results could be read in full",
                    GateResult.Category.DATA_INTEGRITY, AdmissionOutcome.REVIEW,
                    "Result data could not be read: " + dataQuality
                            + ". Scored figures are unreliable and must be checked manually."));
        } else {
            gates.add(GateResult.pass("DATA_NOT_READABLE",
                    "Submitted results could be read in full",
                    GateResult.Category.DATA_INTEGRITY, "All submitted results were readable."));
        }

        if (!o.supplied() && !a.supplied()) {
            // Treated as insufficient information rather than a policy failure, so
            // it forces review even when the applicant scores zero. An application
            // with nothing scorable may be a genuine non-qualifier, or it may be a
            // results-capture failure, and a human should be the one to tell.
            gates.add(GateResult.fail("NO_RESULTS_SUPPLIED",
                    "At least one set of results was submitted",
                    GateResult.Category.DATA_INTEGRITY, AdmissionOutcome.REVIEW,
                    "No O-level or A-level subject results were supplied, so no index could be computed."));
        } else {
            gates.add(GateResult.pass("NO_RESULTS_SUPPLIED",
                    "At least one set of results was submitted",
                    GateResult.Category.POLICY, "O-level: " + o.supplied() + ", A-level: " + a.supplied() + "."));
        }

        Integer minimumPasses = programme.getMinimumUcePasses();
        if (o.supplied() && minimumPasses != null && minimumPasses > 0) {
            if (o.passes() >= minimumPasses) {
                gates.add(GateResult.pass("MINIMUM_UCE_PASSES",
                        "Meets minimum O-level passes",
                        GateResult.Category.POLICY,
                        o.passes() + " passes at or above " + policy.passThresholdGrade()
                                + ", required " + minimumPasses + "."));
            } else {
                gates.add(GateResult.fail("MINIMUM_UCE_PASSES",
                        "Meets minimum O-level passes",
                        GateResult.Category.POLICY, onFailure,
                        o.passes() + " passes at or above " + policy.passThresholdGrade()
                                + ", required " + minimumPasses + "."));
            }
        }

        gates.add(essentialSubjectGate(request, policy, onFailure, a));

        return gates;
    }

    /**
     * Essential subjects were previously only a scoring multiplier of 3.0, so an
     * applicant who took none of them was not excluded in any way. This is a real
     * gate. A failure routes to review rather than rejection because the minimum
     * grade is a newly introduced, unvalidated default.
     */
    private GateResult essentialSubjectGate(ScoringRequest request,
                                            ScoringPolicy policy,
                                            AdmissionOutcome onFailure,
                                            ALevelComponent a) {
        Program programme = request.programme();
        List<String> essential = subjectReader.readProgrammeSubjects(programme.getEssentialSubjects());

        if (essential.isEmpty()) {
            return GateResult.pass("ESSENTIAL_SUBJECTS", "Essential subjects offered",
                    GateResult.Category.POLICY, "Programme declares no essential subjects.");
        }
        if (!a.supplied()) {
            return GateResult.fail("ESSENTIAL_SUBJECTS", "Essential subjects offered",
                    GateResult.Category.POLICY, onFailure,
                    "Programme requires " + String.join(", ", essential) + " but no A-level results were supplied.");
        }

        double minimum = policy.essentialMinimumPoints().orElse(0);
        List<SubjectGrade> taken = subjectReader.readALevel(request.application()).subjects().stream()
                .filter(SubjectGrade::recognised)
                .toList();

        boolean anyEssential = taken.stream()
                .anyMatch(s -> essential.stream().anyMatch(e -> e.equalsIgnoreCase(s.subject().trim())));
        if (!anyEssential) {
            return GateResult.fail("ESSENTIAL_SUBJECTS", "Essential subjects offered",
                    GateResult.Category.POLICY, onFailure,
                    "None of the required subjects (" + String.join(", ", essential) + ") were offered.");
        }

        List<String> below = taken.stream()
                .filter(s -> essential.stream().anyMatch(e -> e.equalsIgnoreCase(s.subject().trim())))
                .filter(s -> s.points() < minimum)
                .map(s -> s.subject() + " (" + s.grade() + ")")
                .toList();
        if (!below.isEmpty()) {
            return GateResult.fail("ESSENTIAL_SUBJECTS", "Essential subjects offered",
                    GateResult.Category.POLICY, onFailure,
                    "Below " + policy.essentialMinimumGrade() + " in essential subject(s): " + String.join(", ", below));
        }

        return GateResult.pass("ESSENTIAL_SUBJECTS", "Essential subjects offered",
                GateResult.Category.POLICY,
                "All essential subjects offered at " + policy.essentialMinimumGrade() + " or above.");
    }

    // ----------------------------------------------------------------- reasons

    private List<String> buildReasons(ScoringRequest request,
                                      OLevelComponent o,
                                      ALevelComponent a,
                                      double index,
                                      List<GateResult> gates,
                                      AdmissionOutcome outcome) {
        ScoringPolicy policy = request.policy();
        Double cutoffIndex = request.cutoffIndex();
        List<String> reasons = new ArrayList<>();

        reasons.add(String.format("Admission index %.1f of 100 (O-level %.1f at %.0f%%, A-level %.1f at %.0f%%).",
                index, o.index(), policy.oLevelWeight(), a.index(), policy.aLevelWeight()));

        if (cutoffIndex == null || cutoffIndex <= 0) {
            reasons.add("This programme has no admission threshold configured, so the application requires manual review.");
        } else {
            reasons.add(String.format("Threshold for this programme is %.1f.", cutoffIndex));
        }

        for (GateResult gate : GateResult.failed(gates)) {
            reasons.add(gate.detail());
        }

        reasons.add(switch (outcome) {
            case ADMIT -> "Meets the published requirements for this programme.";
            case REVIEW -> "Requires an admissions officer decision.";
            case REJECT -> "Does not meet the published requirements for this programme.";
        });

        reasons.add("Scored by " + version().version() + ", effective " + version().effectiveFrom() + ".");
        return reasons;
    }

    // ----------------------------------------------------------------- helpers

    private static String gradeDescription(SubjectGrade subject) {
        return subject.grade() + " = " + trim(subject.points()) + " points";
    }

    private static String trim(double value) {
        if (value == Math.rint(value)) {
            return String.valueOf((long) value);
        }
        return String.valueOf(Math.round(value * 100) / 100.0);
    }

    private static double round2(double value) {
        return Math.round(value * 100) / 100.0;
    }
}
