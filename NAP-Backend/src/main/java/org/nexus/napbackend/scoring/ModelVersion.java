package org.nexus.napbackend.scoring;

/**
 * Identifies the exact scoring rules that produced a decision.
 *
 * <p>Persisted alongside every decision so that a result stays reproducible even
 * after weights change. The previous implementation stored the computed score but
 * not the rules, and only for admitted applicants, so a rejected applicant's
 * score could not be reconstructed at all.
 */
public record ModelVersion(String version, String effectiveFrom, String notes) {

    /**
     * Bump the version whenever scoring behaviour changes. The admission index
     * scale, the O-level/A-level split and the grade vocabulary are all part of
     * the contract implied by this value.
     */
    public static final String CURRENT_VERSION = "weighted-1.0.0";
    public static final String CURRENT_EFFECTIVE_FROM = "2026-01-01";

    public static ModelVersion current() {
        return new ModelVersion(
                CURRENT_VERSION,
                CURRENT_EFFECTIVE_FROM,
                "Normalised 0-6 grade scale, 40/60 O-level to A-level split, review-severity policy gates.");
    }
}
