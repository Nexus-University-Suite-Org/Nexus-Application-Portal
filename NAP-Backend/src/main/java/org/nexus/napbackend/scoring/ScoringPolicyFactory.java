package org.nexus.napbackend.scoring;

import java.util.OptionalDouble;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.model.Program;
import org.springframework.stereotype.Component;

/**
 * Resolves a {@link ScoringPolicy} from the admission scheme and programme.
 *
 * <p>Scheme-level weights take precedence and fall back to the documented
 * defaults, so a deployment that has never been configured still produces stable,
 * explainable numbers. Weighting is always clamped to 100 percent combined and
 * is never allowed to go negative, because a negative weight would invert a
 * score and silently reward weaker results.
 */
@Component
public class ScoringPolicyFactory {

    public ScoringPolicy resolve(Program programme, AdmissionScheme scheme) {
        ScoringPolicy defaults = ScoringPolicy.defaults();

        double oWeight = defaults.oLevelWeight();
        double aWeight = defaults.aLevelWeight();
        int bestOf = defaults.bestOfOLevelSubjects();
        String passThreshold = defaults.passThresholdGrade();

        if (scheme != null) {
            if (scheme.getOLevelWeight() != null && scheme.getOLevelWeight() > 0) {
                oWeight = scheme.getOLevelWeight();
            }
            if (scheme.getALevelWeight() != null && scheme.getALevelWeight() > 0) {
                aWeight = scheme.getALevelWeight();
            } else {
                // Keep the pair summing to 100 when only one side is configured.
                aWeight = Math.max(0, 100 - oWeight);
            }
            if (scheme.getBestOfOLevel() != null && scheme.getBestOfOLevel() > 0) {
                bestOf = scheme.getBestOfOLevel();
            }
            if (scheme.getPassGradeThreshold() != null && !scheme.getPassGradeThreshold().isBlank()) {
                passThreshold = scheme.getPassGradeThreshold().trim();
            }
        }

        String essentialGrade = programme != null && programme.getEssentialMinimumGrade() != null
                && !programme.getEssentialMinimumGrade().isBlank()
                ? programme.getEssentialMinimumGrade().trim()
                : defaults.essentialMinimumGrade();

        OptionalDouble passPoints = GradeScale.passThresholdPoints(passThreshold);
        OptionalDouble essentialPoints = GradeScale.parseUace(essentialGrade);

        return new ScoringPolicy(
                oWeight,
                aWeight,
                bestOf,
                passThreshold,
                passPoints,
                essentialGrade,
                essentialPoints,
                defaults.gateFailureOutcome());
    }
}
