package org.nexus.napbackend.scoring;

import java.util.List;

/**
 * The full result of evaluating one applicant against one programme.
 *
 * <p>Deliberately separate from the legacy {@code dto.QualificationResult} wire
 * format, which is already persisted as JSON in {@code applications.qualification_results}.
 * Adding components to that record would have changed its canonical constructor
 * and left historic rows with null fields, so the rich shape lives here and the
 * new {@code admission_decisions} table stores it.
 *
 * @param programmeCode      programme evaluated
 * @param programmeName      display name of that programme
 * @param outcome            terminal decision
 * @param admissionIndex     score on a 0-100 scale, comparable across programmes
 * @param oLevelIndex        O-level component on 0-100 before weighting
 * @param aLevelIndex        A-level component on 0-100 before weighting
 * @param legacyTotalScore   the pre-revision total, retained for shadow comparison
 * @param legacyCutoffScore  the pre-revision cutoff, retained for shadow comparison
 * @param criteria           every scored component, decomposed
 * @param gates              every hard constraint checked
 * @param dataQuality        trustworthiness flags for this evaluation
 * @param modelVersion       rules that produced this result
 * @param reasons            applicant-facing and officer-facing explanations
 */
public record QualificationEvaluation(
        String programmeCode,
        String programmeName,
        AdmissionOutcome outcome,
        double admissionIndex,
        double oLevelIndex,
        double aLevelIndex,
        double legacyTotalScore,
        double legacyCutoffScore,
        List<CriterionScore> criteria,
        List<GateResult> gates,
        DataQuality dataQuality,
        ModelVersion modelVersion,
        List<String> reasons
) {

    public List<String> failedGateCodes() {
        return gates.stream()
                .filter(g -> !g.passed())
                .map(GateResult::code)
                .toList();
    }
}
