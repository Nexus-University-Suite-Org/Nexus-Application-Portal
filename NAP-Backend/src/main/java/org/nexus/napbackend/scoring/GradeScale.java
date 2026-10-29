package org.nexus.napbackend.scoring;

import java.util.Locale;
import java.util.Map;
import java.util.OptionalDouble;

/**
 * Canonical grade vocabulary for both entry qualifications.
 *
 * <p>Every grade is mapped onto a single 0-6 point scale so that O-level and
 * A-level contributions are commensurable. The previous implementation used
 * 0.3/0.2/0.1 for O-level while A-level used 6.0 x 3.0, which made the entire
 * O-level transcript worth roughly a seventh of a single A-level subject.
 *
 * <p>POLICY ASSUMPTIONS - the admissions committee should confirm these:
 * <ul>
 *   <li>UCE is treated as an 8-grade ordered scale, D1 best and P8 worst. The
 *       numeric suffix is significant, so D1 and D2 score differently.</li>
 *   <li>UACE principal results are graded on nine ranks, A1 through B7. Each is
 *       resolved to its band (A grades score as A, B2-B5 as B, B6-B7 as C) so the
 *       result is consistent with the letter notation. Ordering within a band is
 *       not scored; supply the official UNEB grade-to-point table if that
 *       granularity is wanted.</li>
 *   <li>"Pass" defaults to C6, the most permissive reading, so the newly
 *       introduced minimum-passes gate cannot reject an applicant on a threshold
 *       nobody has validated. C3 is the stricter alternative. Configurable per
 *       admission scheme via {@code passGradeThreshold}.</li>
 * </ul>
 *
 * <p>Nothing here ever returns a silent zero. An unrecognised grade yields an
 * empty {@link OptionalDouble} so the caller can raise a data-quality error,
 * which is what previously caused applicants to be rejected with a score of 0
 * and a confident-sounding explanation.
 */
public final class GradeScale {

    /** Highest points obtainable for a single subject on either qualification. */
    public static final double MAX_SUBJECT_POINTS = 6.0;

    private static final Map<String, Double> UCE = Map.ofEntries(
            Map.entry("D1", 6.0),
            Map.entry("D2", 5.0),
            Map.entry("C3", 4.0),
            Map.entry("C4", 3.0),
            Map.entry("C5", 2.0),
            Map.entry("C6", 1.0),
            Map.entry("P7", 0.5),
            Map.entry("P8", 0.0)
    );

    /**
     * Numeric UACE notation. The exam board issues nine principal grades in rank
     * order: A1, A2, A3, B2, B3, B4, B5, B6, B7. A linear map onto 0-6 across
     * those nine ranks would give B6 and B7 negative points, so each grade
     * resolves to its band instead: A grades score as A, B2-B5 as B, B6-B7 as C.
     *
     * <p>This means ordering within a band is not scored, which is deliberate. A
     * finer mapping needs the official grade-to-point table from UNEB; guessing
     * one would fabricate precision the institution has not sanctioned. Grades
     * outside this set are rejected rather than clamped.
     */
    private static final Map<String, Double> UACE_NUMERIC = Map.of(
            "A1", 6.0,
            "A2", 6.0,
            "A3", 6.0,
            "B2", 5.0,
            "B3", 5.0,
            "B4", 5.0,
            "B5", 5.0,
            "B6", 4.0,
            "B7", 4.0
    );

    /** Letter UACE notation, same ordinal position as A1-A7. */
    private static final Map<String, Double> UACE_LETTER = Map.of(
            "A", 6.0,
            "B", 5.0,
            "C", 4.0,
            "D", 3.0,
            "E", 2.0,
            "O", 1.0,
            "F", 0.0
    );

    /**
     * Legacy bare-numeric O-level input. The original code accepted "1"-"8" via
     * a startsWith check on D/C/P, so some records are stored that way. UCE
     * position 1 is D1, so 1-8 map onto the D1-P8 order.
     */
    private static final Map<String, Double> UCE_NUMERIC = Map.of(
            "1", 6.0,
            "2", 5.0,
            "3", 4.0,
            "4", 3.0,
            "5", 2.0,
            "6", 1.0,
            "7", 0.5,
            "8", 0.0
    );

    private GradeScale() {
    }

    /**
     * Parses an O-level (UCE) grade. Accepts D1-D2, C3-C6, P7-P8 and the legacy
     * bare numeric form. Matching is case-insensitive and whitespace-tolerant.
     */
    public static OptionalDouble parseUce(String rawGrade) {
        String key = normalise(rawGrade);
        if (key.isEmpty()) {
            return OptionalDouble.empty();
        }
        Double exact = UCE.get(key);
        if (exact != null) {
            return OptionalDouble.of(exact);
        }
        Double legacy = UCE_NUMERIC.get(key);
        if (legacy != null) {
            return OptionalDouble.of(legacy);
        }
        // Tolerate partially specified band grades such as "D", "C" or "P" by
        // taking the best grade in that band, which is how a band grade is
        // normally read.
        if (key.length() == 1) {
            Double band = switch (key.charAt(0)) {
                case 'D' -> UCE.get("D1");
                case 'C' -> UCE.get("C3");
                case 'P' -> UCE.get("P7");
                default -> null;
            };
            if (band != null) {
                return OptionalDouble.of(band);
            }
        }
        return OptionalDouble.empty();
    }

    /**
     * Parses an A-level (UACE) grade. Accepts the letter notation A-E/O/F and
     * the numeric notation A1-A7. A numeric suffix that sits outside the known
     * range is rejected rather than clamped, so a typo cannot inflate a score.
     */
    public static OptionalDouble parseUace(String rawGrade) {
        String key = normalise(rawGrade);
        if (key.isEmpty()) {
            return OptionalDouble.empty();
        }
        Double letter = UACE_LETTER.get(key);
        if (letter != null) {
            return OptionalDouble.of(letter);
        }
        Double numeric = UACE_NUMERIC.get(key);
        if (numeric != null) {
            return OptionalDouble.of(numeric);
        }
        return OptionalDouble.empty();
    }

    /**
     * Resolves the point value that counts as a "pass" for the given grade
     * label, used to evaluate {@code minimumUcePasses}. Returns empty if the
     * configured label is not a recognised O-level grade, so a misconfigured
     * threshold surfaces as a configuration error rather than silently passing
     * or failing every applicant.
     */
    public static OptionalDouble passThresholdPoints(String thresholdGrade) {
        return parseUce(thresholdGrade);
    }

    private static String normalise(String rawGrade) {
        if (rawGrade == null) {
            return "";
        }
        return rawGrade.trim().toUpperCase(Locale.ROOT);
    }
}
