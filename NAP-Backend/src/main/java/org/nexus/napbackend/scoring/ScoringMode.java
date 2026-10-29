package org.nexus.napbackend.scoring;

/**
 * Controls how the new engine relates to the legacy rule engine.
 *
 * <p>Configured as {@code nap.admission.scoring.mode}.
 *
 * <ul>
 *   <li>{@link #LEGACY} keeps the previous single-threshold comparison as the
 *       decision of record. Default, because it is what is currently in
 *       production and the new thresholds have not been agreed.</li>
 *   <li>{@link #SHADOW} evaluates and records the new index but leaves the legacy
 *       decision standing. This is how the calibration set gets built: every row
 *       pairs what the legacy engine said with what the new one would say, for
 *       the same applicant, so the committee can choose {@code cutoffIndex} from
 *       evidence instead of guessing.</li>
 *   <li>{@link #ENFORCE} makes the new engine the decision of record.</li>
 * </ul>
 */
public enum ScoringMode {

    LEGACY,
    SHADOW,
    ENFORCE;

    public static ScoringMode from(String raw) {
        if (raw == null || raw.isBlank()) {
            return LEGACY;
        }
        try {
            return valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return LEGACY;
        }
    }
}
