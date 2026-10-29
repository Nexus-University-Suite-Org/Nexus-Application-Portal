package org.nexus.napbackend.scoring;

/**
 * One scored criterion and what it contributed to the admission index.
 *
 * <p>This is the explainability surface: every applicant-facing score can be
 * decomposed into these rows, so a decision never rests on a single opaque
 * number. It is also the shape a future learned model must be able to emit, so
 * swapping the implementation does not change the contract.
 */
public record CriterionScore(
        String code,
        String label,
        double weight,
        double rawPoints,
        double weightedPoints,
        String note
) {
}
