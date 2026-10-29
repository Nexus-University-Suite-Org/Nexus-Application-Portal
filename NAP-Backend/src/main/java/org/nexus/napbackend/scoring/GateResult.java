package org.nexus.napbackend.scoring;

import java.util.List;

/**
 * Result of one hard constraint.
 *
 * <p>Gates come in two kinds, and the distinction matters for correctness:
 *
 * <ul>
 *   <li>{@link Category#DATA_INTEGRITY} covers input we could not read. A
 *       decision derived from unreadable input is not a decision, so a failed
 *       integrity gate forces REVIEW <em>even when the applicant would otherwise
 *       have been rejected</em>. This is the fix for the previous behaviour where
 *       a malformed subject blob produced a score of 0 and a confident
 *       "below cutoff" rejection.</li>
 *   <li>{@link Category#POLICY} and {@link Category#THRESHOLD} cover genuine
 *       admission rules. A failure here means the applicant does not meet the
 *       published requirements, so it only displaces an automatic ADMIT. It must
 *       never turn a REJECT into a REVIEW, because that would let an
 *       unmet-policy applicant back into the admitted pool.</li>
 * </ul>
 *
 * <p>The two policy gates introduced here default to REVIEW rather than REJECT
 * because their thresholds have never been validated against a real applicant
 * population. Committing them straight to REJECT would reject people on the
 * strength of a number nobody has checked.
 */
public record GateResult(
        String code,
        String label,
        Category category,
        boolean passed,
        AdmissionOutcome outcomeOnFailure,
        String detail
) {

    public enum Category {
        DATA_INTEGRITY,
        THRESHOLD,
        POLICY
    }

    public static GateResult pass(String code, String label, Category category, String detail) {
        return new GateResult(code, label, category, true, AdmissionOutcome.REVIEW, detail);
    }

    public static GateResult fail(String code, String label, Category category,
                                  AdmissionOutcome onFailure, String detail) {
        return new GateResult(code, label, category, false, onFailure, detail);
    }

    /**
     * Folds this gate into a provisional outcome. Returns the outcome unchanged
     * when the gate passed or does not apply.
     */
    public AdmissionOutcome applyTo(AdmissionOutcome candidate) {
        if (passed) {
            return candidate;
        }
        if (category == Category.DATA_INTEGRITY) {
            return outcomeOnFailure == AdmissionOutcome.REJECT ? AdmissionOutcome.REVIEW : outcomeOnFailure;
        }
        return candidate == AdmissionOutcome.ADMIT ? outcomeOnFailure : candidate;
    }

    public static List<GateResult> failed(List<GateResult> gates) {
        return gates.stream().filter(g -> !g.passed()).toList();
    }
}
