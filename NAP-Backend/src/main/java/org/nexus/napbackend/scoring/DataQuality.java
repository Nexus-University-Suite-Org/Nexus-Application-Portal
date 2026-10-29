package org.nexus.napbackend.scoring;

import java.util.EnumSet;
import java.util.Set;

/**
 * Flags describing how trustworthy a single evaluation is.
 *
 * <p>These exist because the previous implementation swallowed every parse
 * failure and returned a score of 0, which then produced a rejection reason
 * reading "Score 0.0 is below cutoff of 34.0". The applicant was rejected for a
 * reason the system could not see, and was given a confident and entirely false
 * explanation. Any non-clean evaluation is forced to {@link AdmissionOutcome#REVIEW}.
 */
public final class DataQuality {

    public enum Flag {
        /** A subject blob was absent. Legitimate for applicants with no O-level entry. */
        MISSING_SUBJECTS,
        /** A subject blob was present but could not be parsed as JSON. */
        UNREADABLE_SUBJECTS,
        /** At least one grade was not in the recognised vocabulary. */
        UNKNOWN_GRADE,
        /** Fewer subjects than the qualification implies, suggesting truncated input. */
        SUBJECT_COUNT_ANOMALY,
        /** A subject record had a null or blank name. */
        BLANK_SUBJECT_NAME,
        /** The configured pass threshold is not a recognised O-level grade. */
        INVALID_PASS_THRESHOLD
    }

    private final EnumSet<Flag> flags;

    public DataQuality(Set<Flag> flags) {
        this.flags = flags.isEmpty() ? EnumSet.noneOf(Flag.class) : EnumSet.copyOf(flags);
    }

    public static DataQuality clean() {
        return new DataQuality(Set.of());
    }

    public Set<Flag> flags() {
        return EnumSet.copyOf(flags);
    }

    public boolean isClean() {
        return flags.isEmpty();
    }

    public boolean has(Flag flag) {
        return flags.contains(flag);
    }

    /**
     * True when the evaluation cannot be trusted to produce an automatic
     * admit or reject. Missing subjects alone is not disqualifying, because an
     * applicant genuinely holding no O-level results is a normal case.
     */
    public boolean blocksAutomaticDecision() {
        return flags.contains(Flag.UNREADABLE_SUBJECTS)
                || flags.contains(Flag.UNKNOWN_GRADE)
                || flags.contains(Flag.SUBJECT_COUNT_ANOMALY)
                || flags.contains(Flag.BLANK_SUBJECT_NAME)
                || flags.contains(Flag.INVALID_PASS_THRESHOLD);
    }

    @Override
    public String toString() {
        return flags.isEmpty() ? "CLEAN" : flags.toString();
    }
}
