package org.nexus.napbackend.scoring;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import org.nexus.napbackend.dto.QualificationResult;
import org.nexus.napbackend.dto.QualificationResult.SubjectScore;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;
import org.springframework.stereotype.Component;

/**
 * The scoring implementation that shipped before the revision, reproduced
 * exactly.
 *
 * <p>This exists for one reason: {@link ScoringMode#LEGACY} has to be a true
 * no-op. If the legacy mode merely <em>approximated</em> the old behaviour then
 * turning the new engine on could not be distinguished from a behaviour change,
 * and there would be no safe rollback. So the quirks are reproduced here
 * deliberately, not fixed here:
 *
 * <ul>
 *   <li>Malformed subject JSON scores zero rather than raising, because that is
 *       what the original did.</li>
 *   <li>A cutoff of zero admits everybody, because that is what the original
 *       did. This is the defect that motivated the revision; it is preserved
 *       only so the two engines can be compared row by row.</li>
 *   <li>The 1.5 point female applicant bonus is retained. The new engine has no
 *       notion of gender at all, and keeping the bonus here means a shadow run
 *       shows the real historical decision rather than a flattering one.</li>
 *   <li>Numeric UACE grades score 6-(n-1), so {@code A1} parses as a non-number
 *       and scores zero. That is the original defect, not an endorsement.</li>
 * </ul>
 *
 * <p>Do not improve this class. Every deviation must go into
 * {@link RuleBasedQualificationModel}, where it is covered by tests and can be
 * rolled out deliberately.
 */
@Component
public class LegacyScoringEngine {

    /** The gender bonus the original applied. Reproduced only for comparison. */
    static final double GENDER_BONUS = 1.5;

    private static final double ESSENTIAL_WEIGHT = 3.0;
    private static final double RELEVANT_WEIGHT = 2.0;
    private static final double DESIRABLE_WEIGHT = 1.0;
    private static final double OTHER_WEIGHT = 0.5;
    private static final int BEST_OF_O_LEVEL = 8;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * A legacy run plus the outcome it implies.
     *
     * <p>Returned together because both come from the same arithmetic, and the
     * arithmetic must only run once: parsing the subject JSON twice would be
     * wasted work on the hot path and would risk the two copies disagreeing.
     *
     * @param result the wire result, byte-compatible with the original engine
     * @param outcome {@link AdmissionOutcome#ADMIT} when the original
     *                {@code adjustedScore >= cutoffScore} comparison passed, else
     *                {@link AdmissionOutcome#REJECT}. There is deliberately no
     *                {@code REVIEW}: the original engine could not produce one.
     */
    public record LegacyEvaluation(QualificationResult result, AdmissionOutcome outcome) {}

    public double calculateOLevelWeight(String oLevelSubjectsJson) {
        try {
            List<SubjectGrade> subjects = parseSubjects(oLevelSubjectsJson);
            return subjects.stream()
                    .map(this::oLevelPoints)
                    .sorted(Comparator.reverseOrder())
                    .limit(BEST_OF_O_LEVEL)
                    .mapToDouble(Double::doubleValue)
                    .sum();
        } catch (Exception e) {
            return 0;
        }
    }

    public double calculateALevelWeight(String uaceSubjectsJson, Program programme) {
        try {
            List<SubjectGrade> subjects = parseSubjects(uaceSubjectsJson);
            List<String> essential = parseSubjectList(programme.getEssentialSubjects());
            List<String> relevant = parseSubjectList(programme.getRelevantSubjects());
            List<String> desirable = parseSubjectList(programme.getDesirableSubjects());

            double total = 0;
            for (SubjectGrade subject : subjects) {
                double gradePoints = aLevelGradePoints(subject.grade());
                total += gradePoints * weightFor(subject, essential, relevant, desirable);
            }
            return total;
        } catch (Exception e) {
            return 0;
        }
    }

    public QualificationResult evaluate(Application app, Program programme) {
        return evaluateWithOutcome(app, programme).result();
    }

    /**
     * The single authoritative legacy evaluation.
     *
     * <p>Callers must not re-derive the legacy outcome from the component
     * scores. Doing so is how the previous attempt got it wrong: it treated a
     * missing cutoff as a reason to send the applicant to review, whereas the
     * original engine defaulted the cutoff to zero and therefore admitted
     * everybody. That is the defect this whole revision exists to fix, but it has
     * to stay intact here or the shadow comparison lies about history.
     */
    public LegacyEvaluation evaluateWithOutcome(Application app, Program programme) {
        double oLevelScore = calculateOLevelWeight(app.getOLevelSubjects());
        double aLevelScore = calculateALevelWeight(app.getUacePrincipalSubjects(), programme);
        double totalScore = oLevelScore + aLevelScore;

        boolean isFemale = "Female".equalsIgnoreCase(app.getGender());
        double adjustedScore = isFemale ? totalScore + GENDER_BONUS : totalScore;
        double cutoffScore = programme.getCutoffScore() == null ? 0.0 : programme.getCutoffScore();
        boolean qualified = adjustedScore >= cutoffScore;

        String reason = "Score " + format(totalScore)
                + (isFemale ? " + " + format(GENDER_BONUS) + " female applicant bonus = " + format(adjustedScore) : "")
                + (qualified ? " meets cutoff of " : " is below cutoff of ") + format(cutoffScore);

        return new LegacyEvaluation(
                new QualificationResult(
                        programme.getProgramCode(),
                        programme.getProgramName(),
                        qualified,
                        totalScore,
                        adjustedScore,
                        isFemale,
                        cutoffScore,
                        oLevelScore,
                        aLevelScore,
                        breakdown(app, programme),
                        reason
                ),
                qualified ? AdmissionOutcome.ADMIT : AdmissionOutcome.REJECT
        );
    }

    private List<SubjectScore> breakdown(Application app, Program programme) {
        List<SubjectScore> breakdown = new ArrayList<>();
        try {
            List<SubjectGrade> subjects = parseSubjects(app.getUacePrincipalSubjects());
            List<String> essential = parseSubjectList(programme.getEssentialSubjects());
            List<String> relevant = parseSubjectList(programme.getRelevantSubjects());
            List<String> desirable = parseSubjectList(programme.getDesirableSubjects());

            for (SubjectGrade subject : subjects) {
                double gradePoints = aLevelGradePoints(subject.grade());
                String category = categoryOf(subject, essential, relevant, desirable);
                double weight = weightFor(subject, essential, relevant, desirable);
                breakdown.add(new SubjectScore(
                        subject.subject(), subject.grade(), category,
                        gradePoints, weight, gradePoints * weight));
            }
        } catch (Exception ignored) {
            // The original swallowed this too; the breakdown is presentational only.
        }
        return breakdown;
    }

    private String categoryOf(SubjectGrade subject, List<String> essential,
                              List<String> relevant, List<String> desirable) {
        if (containsIgnoreCase(essential, subject.subject())) return "Essential";
        if (containsIgnoreCase(relevant, subject.subject())) return "Relevant";
        if (containsIgnoreCase(desirable, subject.subject())) return "Desirable";
        return "Other";
    }

    private double weightFor(SubjectGrade subject, List<String> essential,
                             List<String> relevant, List<String> desirable) {
        if (containsIgnoreCase(essential, subject.subject())) return ESSENTIAL_WEIGHT;
        if (containsIgnoreCase(relevant, subject.subject())) return RELEVANT_WEIGHT;
        if (containsIgnoreCase(desirable, subject.subject())) return DESIRABLE_WEIGHT;
        return OTHER_WEIGHT;
    }

    private static boolean containsIgnoreCase(List<String> declared, String subject) {
        if (subject == null) return false;
        return declared.stream().anyMatch(s -> s.equalsIgnoreCase(subject.trim()));
    }

    private static String format(double value) {
        return String.format("%.1f", value);
    }

    private double oLevelPoints(SubjectGrade subject) {
        String grade = subject.grade() == null ? "" : subject.grade().toUpperCase().trim();
        if (grade.startsWith("D1") || grade.startsWith("D2") || grade.equals("1") || grade.equals("2")) return 0.3;
        if (grade.startsWith("C") || grade.equals("3") || grade.equals("4") || grade.equals("5") || grade.equals("6")) return 0.2;
        if (grade.startsWith("P") || grade.equals("7") || grade.equals("8")) return 0.1;
        return 0;
    }

    private double aLevelGradePoints(String grade) {
        if (grade == null) return 0;
        String g = grade.toUpperCase().trim();
        return switch (g) {
            case "A" -> 6.0;
            case "B" -> 5.0;
            case "C" -> 4.0;
            case "D" -> 3.0;
            case "E" -> 2.0;
            case "O" -> 1.0;
            case "F" -> 0.0;
            default -> {
                try {
                    int num = Integer.parseInt(g);
                    yield Math.max(0, 6 - (num - 1));
                } catch (NumberFormatException e) {
                    yield 0;
                }
            }
        };
    }

    private List<SubjectGrade> parseSubjects(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            List<SubjectGrade> parsed = objectMapper.readValue(json, new TypeReference<>() {});
            return parsed == null ? List.of() : parsed;
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<String> parseSubjectList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            List<String> parsed = objectMapper.readValue(json, new TypeReference<>() {});
            if (parsed != null) return parsed;
        } catch (Exception ignored) {
            // Fall through to the comma-separated form below.
        }
        return Arrays.stream(json.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private record SubjectGrade(String subject, String grade) {}
}
