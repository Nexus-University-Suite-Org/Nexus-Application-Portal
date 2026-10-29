package org.nexus.napbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.nexus.napbackend.dto.QualificationResult;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.scoring.AdmissionOutcome;
import org.nexus.napbackend.scoring.QualificationEvaluation;
import org.nexus.napbackend.scoring.ScoringMode;
import org.nexus.napbackend.scoring.ScoringService;
import org.springframework.stereotype.Service;

/**
<<<<<<< HEAD
 * Adapter that keeps the pre-existing public surface working while the scoring
 * itself lives in the {@code scoring} package.
 *
 * <p>This class no longer decides anything. Three behaviours of the original
 * implementation were defective and have been replaced by
 * {@link ScoringService}:
 *
 * <ul>
 *   <li>The 1.5 point female applicant bonus. Gender is not read by the new
 *       scoring engine at all, and must not become a learned coefficient later
 *       either.</li>
 *   <li>{@code catch (Exception) { return 0; }} on subject parsing, which turned a
 *       malformed record into a score of zero and a confident "below cutoff"
 *       rejection. Unreadable input now forces a review.</li>
 *   <li>{@code adjustedScore >= cutoffScore} against a cutoff that defaults to
 *       0.0, which admitted every applicant to any programme whose threshold had
 *       not been set. A missing threshold now means review.</li>
 * </ul>
 *
 * <p>Which of those fixes an applicant actually sees is decided by
 * {@link ScoringService} according to the configured mode. Until the committee
 * agrees the new thresholds, the deployment stays in {@code LEGACY} and this
 * adapter returns the original arithmetic, so the fixes are available but inert.
=======
 * Uganda public-university admission weighting. Kept in parity with the
 * frontend wizard (src/lib/weighting.ts) so student guidance and the admin
 * review scorer agree:
 *
 *   A-Level (principals only): grade points (A=6 … F=0, O=1) × category weight
 *       (Essential ×3, Relevant ×2, Desirable ×1; unlisted = 0).
 *   Subsidiary (General Paper etc.): flat +1.0 per passed subject.
 *   O-Level (UCE): separate best-8 lump (max 2.4), never categorised.
 *   Female: +1.5 affirmative-action bonus.
 *
 * NAD subject lists mix O-Level/UCE entries (e.g. "English Language (UCE
 * O-level, credit or better)") with real A-Level requirements. UCE segments
 * are stripped before categorisation; where the NAD records omit the real
 * A-Level Essentials they are supplied by AL_ESSENTIAL_OVERRIDES.
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
 */
@Service
public class WeightingService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ScoringService scoringService;

<<<<<<< HEAD
    public WeightingService(ScoringService scoringService) {
        this.scoringService = scoringService;
    }

    /**
     * Produces the legacy wire shape for one programme, delegating the mode
     * decision to {@link ScoringService#qualificationResult}.
     */
    public QualificationResult evaluateQualification(Application app, Program programme) {
        return evaluateQualification(app, programme, null);
    }

    /** As above, with the applicant's scheme so scheme-level policy can apply. */
    public QualificationResult evaluateQualification(Application app, Program programme, AdmissionScheme scheme) {
        if (programme == null) {
            return null;
        }
        return scoringService.qualificationResult(app, programme, scheme);
=======
    private static final double GENDER_BONUS = 1.5;
    private static final double SUBSIDIARY_FLAT_POINTS = 1.0;

    /**
     * Real A-Level Essential subjects per programme. The NAD essentialSubjects
     * field currently carries O-Level requirements only, so the ×3 tier would
     * otherwise never apply. Applied before NAD data; remove entries as the
     * NAD records are corrected.
     */
    private static final Map<String, List<String>> AL_ESSENTIAL_OVERRIDES = Map.of(
            "BCOM-ACC", List.of("Mathematics", "Economics"),
            "BSC-CS", List.of("Mathematics"),
            "BSC-NUR", List.of("Biology", "Chemistry"));

    public double calculateOLevelWeight(String oLevelSubjectsJson) {
        try {
            List<SubjectGrade> subjects = parseSubjects(oLevelSubjectsJson);
            return subjects.stream()
                    .map(this::oLevelPoints)
                    .sorted(Comparator.reverseOrder())
                    .limit(8)
                    .mapToDouble(Double::doubleValue)
                    .sum();
        } catch (Exception e) {
            return 0;
        }
    }

    public double calculateALevelWeight(String uaceSubjectsJson, Program programme) {
        try {
            List<SubjectGrade> subjects = parseSubjects(uaceSubjectsJson);
            return subjects.stream()
                    .mapToDouble(sg -> round1(aLevelGradePoints(sg.grade()) * classify(sg.subject(), programme).weight()))
                    .sum();
        } catch (Exception e) {
            return 0;
        }
    }

    public double calculateSubsidiaryWeight(Application app) {
        double total = 0;
        if (passesSubsidiaryGrade(app.getUaceGeneralPaperGrade())) total += SUBSIDIARY_FLAT_POINTS;
        if (passesSubsidiaryGrade(app.getUaceIctOrSubMathGrade())) total += SUBSIDIARY_FLAT_POINTS;
        return total;
    }

    private boolean passesSubsidiaryGrade(String grade) {
        if (grade == null || grade.isBlank()) return false;
        return aLevelGradePoints(grade) > 0;
    }

    public QualificationResult evaluateQualification(Application app, Program programme) {
        double oLevelScore = round1(calculateOLevelWeight(app.getOLevelSubjects()));
        double aLevelScore = round1(calculateALevelWeight(app.getUacePrincipalSubjects(), programme));
        double subsidiaryScore = round1(calculateSubsidiaryWeight(app));
        double totalScore = round1(aLevelScore + subsidiaryScore + oLevelScore);

        boolean isFemale = "Female".equalsIgnoreCase(app.getGender());
        double adjustedScore = round1(isFemale ? totalScore + GENDER_BONUS : totalScore);

        List<String> missingEssentials = new ArrayList<>();
        for (String essential : aLevelEssentials(programme)) {
            boolean present = false;
            for (SubjectGrade sg : parseSubjects(app.getUacePrincipalSubjects())) {
                if (subjectListed(sg.subject(), essential)) {
                    present = true;
                    break;
                }
            }
            if (!present) missingEssentials.add(essential);
        }
        boolean ineligible = !missingEssentials.isEmpty();
        boolean qualified = !ineligible && adjustedScore >= safeCutoff(programme);

        List<SubjectScore> breakdown = new ArrayList<>();
        try {
            List<SubjectGrade> uaceSubjects = parseSubjects(app.getUacePrincipalSubjects());
            for (SubjectGrade sg : uaceSubjects) {
                double gradePoints = aLevelGradePoints(sg.grade());
                CategoryWeight cw = classify(sg.subject(), programme);
                breakdown.add(new SubjectScore(sg.subject(), sg.grade(), cw.category(), gradePoints,
                        cw.weight(), round1(gradePoints * cw.weight())));
            }
            addSubsidiaryBreakdown(breakdown, "General Paper", app.getUaceGeneralPaperGrade());
            if (app.getUaceIctOrSubMathSubject() != null && !app.getUaceIctOrSubMathSubject().isBlank()) {
                addSubsidiaryBreakdown(breakdown, app.getUaceIctOrSubMathSubject(), app.getUaceIctOrSubMathGrade());
            }
        } catch (Exception ignored) {}

        String reason;
        if (ineligible) {
            reason = "Missing essential A-Level subject(s): " + String.join(", ", missingEssentials)
                    + " — score " + fmt(totalScore)
                    + (isFemale ? " + " + fmt(GENDER_BONUS) + " female bonus = " + fmt(adjustedScore) : "")
                    + " but the programme requires them";
        } else if (qualified) {
            reason = "Score " + fmt(totalScore)
                    + (isFemale ? " + " + fmt(GENDER_BONUS) + " female applicant bonus = " + fmt(adjustedScore) : "")
                    + " meets cutoff of " + fmt(safeCutoff(programme));
        } else if (safeCutoff(programme) < 30.0 && !ineligible) {
            reason = "Score " + fmt(adjustedScore)
                    + (isFemale ? " (incl. " + fmt(GENDER_BONUS) + " female bonus)" : "")
                    + " — programme cut-off " + fmt(safeCutoff(programme))
                    + " appears to be on the old raw scale; confirm the weighted cut-off with admissions";
        } else {
            reason = "Score " + fmt(totalScore)
                    + (isFemale ? " + " + fmt(GENDER_BONUS) + " female applicant bonus = " + fmt(adjustedScore) : "")
                    + " is below cutoff of " + fmt(safeCutoff(programme));
        }

        return new QualificationResult(
                programme.getProgramCode(), programme.getProgramName(), qualified,
                totalScore, adjustedScore, isFemale,
                safeCutoff(programme),
                oLevelScore, aLevelScore, breakdown, reason
        );
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
    }

    public String evaluateAllChoices(Application app, List<Program> programmes) {
        return evaluateAllChoices(app, programmes, null);
    }

    public String evaluateAllChoices(Application app, List<Program> programmes, AdmissionScheme scheme) {
        List<QualificationResult> results = new ArrayList<>();
        for (Program programme : programmes) {
            QualificationResult result = evaluateQualification(app, programme, scheme);
            if (result != null) {
                results.add(result);
            }
        }
        try {
            return objectMapper.writeValueAsString(results);
        } catch (Exception e) {
            return "[]";
        }
    }

    /**
     * Returns the first chosen programme the active engine admitted, or null when
     * none qualifies.
     *
     * <p>Auto-assignment follows the mode too. A legacy run auto-assigns on the
     * old threshold, because that is what it always did. An enforcing run only
     * auto-assigns a real {@link AdmissionOutcome#ADMIT}, and deliberately leaves
     * an applicant needing review unassigned, because an assignment is a decision
     * of record and must be made by a person.
     */
    public String findAssignedProgramme(Application app, List<Program> programmes) {
        return findAssignedProgramme(app, programmes, null);
    }

    public String findAssignedProgramme(Application app, List<Program> programmes, AdmissionScheme scheme) {
        String[] choices = {
                app.getProgramChoice1(), app.getProgramChoice2(),
                app.getProgramChoice3(), app.getProgramChoice4()
        };
        for (String choice : choices) {
            if (choice == null || choice.isBlank()) {
                continue;
            }
            for (Program programme : programmes) {
                if (programme == null || programme.getProgramCode() == null) {
                    continue;
                }
                boolean matches = programme.getProgramCode().equalsIgnoreCase(choice)
                        || (programme.getProgramName() != null
                            && programme.getProgramName().equalsIgnoreCase(choice));
                if (matches && isAutoAssignable(app, programme, scheme)) {
                    return programme.getProgramCode();
                }
            }
        }
        return null;
    }

<<<<<<< HEAD
    private boolean isAutoAssignable(Application app, Program programme, AdmissionScheme scheme) {
        if (scoringService.mode() == ScoringMode.ENFORCE) {
            return scoringService.outcomeOf(app, programme, scheme) == AdmissionOutcome.ADMIT;
=======
    private double safeCutoff(Program programme) {
        return programme.getCutoffScore() == null ? 0.0 : programme.getCutoffScore();
    }

    private double oLevelPoints(SubjectGrade sg) {
        String grade = sg.grade().toUpperCase().trim();
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

    private double round1(double value) {
        return Math.round(value * 10) / 10.0;
    }

    private String fmt(double value) {
        return String.format("%.1f", value);
    }

    private void addSubsidiaryBreakdown(List<SubjectScore> breakdown, String subject, String grade) {
        if (subject == null || subject.isBlank() || grade == null || grade.isBlank()) return;
        double gradePoints = aLevelGradePoints(grade);
        boolean passed = gradePoints > 0;
        double points = passed ? SUBSIDIARY_FLAT_POINTS : 0.0;
        breakdown.add(new SubjectScore(subject, grade, passed ? "Subsidiary" : "Subsidiary (fail)",
                gradePoints, points, points));
    }

    private CategoryWeight classify(String subject, Program programme) {
        for (String essential : aLevelEssentials(programme)) {
            if (subjectListed(subject, essential)) return new CategoryWeight("Essential", 3.0);
        }
        if (subjectListed(subject, cleanListText(programme.getRelevantSubjects()))) {
            return new CategoryWeight("Relevant", 2.0);
        }
        if (subjectListed(subject, cleanListText(programme.getDesirableSubjects()))) {
            return new CategoryWeight("Desirable", 1.0);
        }
        return new CategoryWeight("Other", 0.0);
    }

    private record CategoryWeight(String category, double weight) {}

    private List<String> aLevelEssentials(Program programme) {
        List<String> override = AL_ESSENTIAL_OVERRIDES.get(programme.getProgramCode());
        if (override != null) return override;
        return tokenizeSubjectList(cleanListText(programme.getEssentialSubjects()));
    }

    /** Removes O-Level/UCE segments from a NAD subject list (A-Level requirements only). */
    private String cleanListText(String text) {
        if (text == null || text.isBlank()) return "";
        return Arrays.stream(text.split(";"))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && !isUceSegment(s))
                .collect(Collectors.joining("; "));
    }

    private boolean isUceSegment(String segment) {
        String t = segment.toLowerCase().replaceAll("[^a-z]", "");
        return t.contains("uce") || t.contains("olevel");
    }

    private List<String> tokenizeSubjectList(String text) {
        if (text == null || text.isBlank()) return List.of();
        return Arrays.stream(text.split("\\s*;\\s*|\\s*,\\s*|\\s+or\\s+"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    /**
     * Contextual whole-word match, mirrored from the frontend: "Mathematics"
     * matches a list that also says "Subsidiary Mathematics", and "Further
     * Mathematics" does not satisfy a bare "Mathematics" requirement.
     */
    private boolean subjectListed(String subject, String listText) {
        if (subject == null || subject.isBlank() || listText == null || listText.isBlank()) {
            return false;
        }
        String normalizedList = normalize(listText);
        String normalizedSubject = normalize(subject);

        if (normalizedSubject.equals("ict")) {
            if (normalizedList.matches(".*information.*communication.*technology.*")) return true;
        }
        if (normalizedSubject.contains("information") && normalizedSubject.contains("communication")
                && normalizedSubject.contains("technology")) {
            if (Pattern.compile("(^|\\W)ict(\\W|$)").matcher(normalizedList).find()) return true;
        }

        String[] tokens = normalizedSubject.split(" ");
        Pattern pattern = Pattern.compile("(^|\\W)" + Pattern.quote(tokens[0]) + "(\\W|$)");
        if (tokens.length >= 2) {
            for (String token : tokens) {
                if (token.isEmpty()) continue;
                if (!Pattern.compile("(^|\\W)" + Pattern.quote(token) + "(\\W|$)").matcher(normalizedList).find()) {
                    return false;
                }
            }
            return true;
        }
        return pattern.matcher(normalizedList).find();
    }

    private String normalize(String s) {
        return s.toLowerCase()
                .replaceAll("[’`]", "'")
                .replaceAll("[^\\w\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    @SuppressWarnings("unchecked")
    private List<SubjectGrade> parseSubjects(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
        }
        return evaluateQualification(app, programme, scheme).qualified();
    }
<<<<<<< HEAD
}
=======

    public record SubjectGrade(String subject, String grade) {}
}
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
