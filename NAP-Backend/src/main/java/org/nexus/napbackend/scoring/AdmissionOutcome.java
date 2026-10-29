package org.nexus.napbackend.scoring;

/**
 * Terminal outcome of a qualification evaluation.
 *
 * <p>{@link #REVIEW} is the safe default. The gates added in this revision use
 * thresholds that have never been validated against a real applicant population,
 * so they route to human review rather than auto-rejecting. A programme without
 * a configured threshold also lands here instead of admitting everyone, which is
 * the fail-closed behaviour the previous {@code adjustedScore >= 0.0} check
 * lacked.
 */
public enum AdmissionOutcome {
    ADMIT,
    REVIEW,
    REJECT
}
