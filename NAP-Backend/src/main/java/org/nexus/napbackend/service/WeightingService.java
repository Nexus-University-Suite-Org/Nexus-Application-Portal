package org.nexus.napbackend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.nexus.napbackend.dto.QualificationResult;
import org.nexus.napbackend.dto.QualificationResult.SubjectScore;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Programme;
import org.springframework.stereotype.Service;

@Service
public class WeightingService {

    private final ObjectMapper objectMapper = new ObjectMapper();

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

    public double calculateALevelWeight(String uaceSubjectsJson, Programme programme) {
        try {
            List<SubjectGrade> subjects = parseSubjects(uaceSubjectsJson);
            List<String> essential = parseSubjectList(programme.getEssentialSubjects());
            List<String> relevant = parseSubjectList(programme.getRelevantSubjects());
            List<String> desirable = parseSubjectList(programme.getDesirableSubjects());

            double total = 0;
            for (SubjectGrade sg : subjects) {
                String subject = sg.subject();
                String grade = sg.grade();
                double gradePoints = aLevelGradePoints(grade);
                double weight;

                if (essential.stream().anyMatch(s -> s.equalsIgnoreCase(subject))) {
                    weight = 3.0;
                } else if (relevant.stream().anyMatch(s -> s.equalsIgnoreCase(subject))) {
                    weight = 2.0;
                } else if (desirable.stream().anyMatch(s -> s.equalsIgnoreCase(subject))) {
                    weight = 1.0;
                } else {
                    weight = 0.5;
                }
                total += gradePoints * weight;
            }
            return total;
        } catch (Exception e) {
            return 0;
        }
    }

    public QualificationResult evaluateQualification(Application app, Programme programme) {
        double oLevelScore = calculateOLevelWeight(app.getOLevelSubjects());
        double aLevelScore = calculateALevelWeight(app.getUacePrincipalSubjects(), programme);
        double totalScore = oLevelScore + aLevelScore;
        boolean qualified = totalScore >= programme.getCutoffScore();

        List<SubjectScore> breakdown = new ArrayList<>();
        try {
            List<SubjectGrade> uaceSubjects = parseSubjects(app.getUacePrincipalSubjects());
            List<String> essential = parseSubjectList(programme.getEssentialSubjects());
            List<String> relevant = parseSubjectList(programme.getRelevantSubjects());
            List<String> desirable = parseSubjectList(programme.getDesirableSubjects());

            for (SubjectGrade sg : uaceSubjects) {
                double gradePoints = aLevelGradePoints(sg.grade());
                String category;
                double weight;
                if (essential.stream().anyMatch(s -> s.equalsIgnoreCase(sg.subject()))) {
                    category = "Essential"; weight = 3.0;
                } else if (relevant.stream().anyMatch(s -> s.equalsIgnoreCase(sg.subject()))) {
                    category = "Relevant"; weight = 2.0;
                } else if (desirable.stream().anyMatch(s -> s.equalsIgnoreCase(sg.subject()))) {
                    category = "Desirable"; weight = 1.0;
                } else {
                    category = "Other"; weight = 0.5;
                }
                breakdown.add(new SubjectScore(sg.subject(), sg.grade(), category, gradePoints, weight, gradePoints * weight));
            }
        } catch (Exception ignored) {}

        String reason = qualified
                ? "Score " + String.format("%.1f", totalScore) + " meets cutoff of " + String.format("%.1f", programme.getCutoffScore())
                : "Score " + String.format("%.1f", totalScore) + " is below cutoff of " + String.format("%.1f", programme.getCutoffScore());

        return new QualificationResult(
                programme.getCode(), programme.getName(), qualified,
                totalScore, programme.getCutoffScore(),
                oLevelScore, aLevelScore, breakdown, reason
        );
    }

    public String evaluateAllChoices(Application app, List<Programme> programmes) {
        List<QualificationResult> results = new ArrayList<>();
        String[] choices = {app.getProgramChoice1(), app.getProgramChoice2(), app.getProgramChoice3(), app.getProgramChoice4()};
        for (String choice : choices) {
            if (choice == null || choice.isBlank()) continue;
            programmes.stream()
                    .filter(p -> p.getCode().equalsIgnoreCase(choice) || p.getName().equalsIgnoreCase(choice))
                    .findFirst()
                    .ifPresent(programme -> results.add(evaluateQualification(app, programme)));
        }
        try {
            return objectMapper.writeValueAsString(results);
        } catch (Exception e) {
            return "[]";
        }
    }

    public String findAssignedProgramme(Application app, List<Programme> programmes) {
        String[] choices = {app.getProgramChoice1(), app.getProgramChoice2(), app.getProgramChoice3(), app.getProgramChoice4()};
        for (String choice : choices) {
            if (choice == null || choice.isBlank()) continue;
            for (Programme programme : programmes) {
                if (programme.getCode().equalsIgnoreCase(choice) || programme.getName().equalsIgnoreCase(choice)) {
                    QualificationResult result = evaluateQualification(app, programme);
                    if (result.qualified()) {
                        return programme.getCode();
                    }
                }
            }
        }
        return null;
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

    @SuppressWarnings("unchecked")
    private List<SubjectGrade> parseSubjects(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<String> parseSubjectList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    public record SubjectGrade(String subject, String grade) {}
}
