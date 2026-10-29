package org.nexus.napbackend.scoring;

import java.util.OptionalDouble;

/**
 * Tunable inputs to a scoring run, resolved from the admission scheme and the
 * programme. Defaults are chosen so that an unconfigured deployment still behaves
 * sensibly and fails closed.
 *
 * @param oLevelWeight         percentage of the index drawn from O-level results
 * @param aLevelWeight         percentage of the index drawn from A-level results
 * @param bestOfOLevelSubjects how many best O-level subjects to count
 * @param passThresholdGrade   grade label counting as a pass for minimumUcePasses
 * @param passThresholdPoints  resolved point value of that label
 * @param essentialMinimumGrade minimum UACE grade required in an essential subject
 * @param essentialMinimumPoints resolved point value of that label
 * @param gateFailureOutcome   what a failed policy gate does
 */
public record ScoringPolicy(
        double oLevelWeight,
        double aLevelWeight,
        int bestOfOLevelSubjects,
        String passThresholdGrade,
        OptionalDouble passThresholdPoints,
        String essentialMinimumGrade,
        OptionalDouble essentialMinimumPoints,
        AdmissionOutcome gateFailureOutcome
) {

    /** The 40/60 split: A-level predicts performance better, but O-level must still discriminate. */
    public static final double DEFAULT_O_LEVEL_WEIGHT = 40.0;
    public static final double DEFAULT_A_LEVEL_WEIGHT = 60.0;
    public static final int DEFAULT_BEST_OF_O_LEVEL = 8;

    /**
     * C6, not C3. C3 is often cited as the O-level pass mark, but the
     * minimum-passes gate did not exist before this change, so the stricter
     * reading would newly reject applicants against a threshold that has never
     * been agreed or tested against a real cohort. C6 counts any credit-level
     * result as a pass and cannot wrongly exclude anyone. The gate's real
     * discrimination comes from the admission index; this is only a floor.
     */
    public static final String DEFAULT_PASS_GRADE = "C6";

    public static ScoringPolicy defaults() {
        return new ScoringPolicy(
                DEFAULT_O_LEVEL_WEIGHT,
                DEFAULT_A_LEVEL_WEIGHT,
                DEFAULT_BEST_OF_O_LEVEL,
                DEFAULT_PASS_GRADE,
                GradeScale.passThresholdPoints(DEFAULT_PASS_GRADE),
                "C",
                GradeScale.parseUace("C"),
                AdmissionOutcome.REVIEW);
    }
}
