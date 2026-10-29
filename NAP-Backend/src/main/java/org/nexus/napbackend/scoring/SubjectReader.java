package org.nexus.napbackend.scoring;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.Set;
import java.util.function.Function;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;
import org.springframework.stereotype.Component;

/**
 * Reads subject blobs into {@link SubjectGrade} records, resolving every grade
 * against {@link GradeScale} and recording anything unreadable.
 *
 * <p>Extracted from {@code WeightingService} so that reading input and scoring
 * it are separately testable. The critical behaviour difference from the original
 * is that a parse failure is never converted into a score of zero; it is
 * returned as a {@link SubjectParseResult} carrying the reason.
 */
@Component
public class SubjectReader {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /** The shape subject blobs are stored in. */
    private record RawSubject(String subject, String grade) {
    }

    public SubjectParseResult readOLevel(Application application) {
        return readOLevelJson(application.getOLevelSubjects());
    }

    public SubjectParseResult readALevel(Application application) {
        return readALevelJson(application.getUacePrincipalSubjects());
    }

    public SubjectParseResult readOLevelJson(String json) {
        return read(json, GradeScale::parseUce, "O-level");
    }

    public SubjectParseResult readALevelJson(String json) {
        return read(json, GradeScale::parseUace, "A-level");
    }

    private SubjectParseResult read(String json, Function<String, OptionalDouble> parser, String label) {
        if (json == null || json.isBlank()) {
            return SubjectParseResult.missing();
        }

        List<RawSubject> raw;
        try {
            raw = objectMapper.readValue(json, new TypeReference<List<RawSubject>>() {
            });
        } catch (Exception e) {
            return SubjectParseResult.unreadable(
                    "could not read " + label + " subject list: " + e.getClass().getSimpleName());
        }
        if (raw == null) {
            return SubjectParseResult.missing();
        }

        Set<DataQuality.Flag> flags = EnumSet.noneOf(DataQuality.Flag.class);
        List<SubjectGrade> subjects = new ArrayList<>(raw.size());
        for (RawSubject entry : raw) {
            String name = entry == null || entry.subject() == null ? "" : entry.subject().trim();
            String grade = entry == null ? null : entry.grade();
            if (name.isEmpty()) {
                flags.add(DataQuality.Flag.BLANK_SUBJECT_NAME);
            }
            if (grade == null || grade.isBlank()) {
                flags.add(DataQuality.Flag.UNKNOWN_GRADE);
                subjects.add(SubjectGrade.unrecognised(name, grade));
                continue;
            }
            OptionalDouble points = parser.apply(grade);
            if (points.isEmpty()) {
                flags.add(DataQuality.Flag.UNKNOWN_GRADE);
                subjects.add(SubjectGrade.unrecognised(name, grade));
            } else {
                subjects.add(new SubjectGrade(name, grade.trim().toUpperCase(), points.getAsDouble(), true));
            }
        }

        DataQuality dataQuality = new DataQuality(flags);
        return new SubjectParseResult(subjects, dataQuality, Optional.empty());
    }

    /**
     * Reads a programme subject list. Programme configuration is stored as a
     * JSON array, but older rows hold a comma-separated string, so both are
     * accepted. A malformed configuration degrades to an empty list, which makes
     * the subject category contribute nothing rather than crashing a decision.
     */
    public List<String> readProgrammeSubjects(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            List<String> parsed = objectMapper.readValue(json, new TypeReference<List<String>>() {
            });
            if (parsed != null) {
                return parsed.stream()
                        .filter(s -> s != null && !s.isBlank())
                        .map(String::trim)
                        .toList();
            }
        } catch (Exception ignored) {
            // fall through to the comma-separated form
        }
        return Arrays.stream(json.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    /** Categorises a subject against a programme's declared subject lists. */
    public String categorise(String subject, Program programme) {
        return categorise(subject,
                readProgrammeSubjects(programme.getEssentialSubjects()),
                readProgrammeSubjects(programme.getRelevantSubjects()),
                readProgrammeSubjects(programme.getDesirableSubjects()));
    }

    static String categorise(String subject, List<String> essential, List<String> relevant, List<String> desirable) {
        if (matches(subject, essential)) {
            return "Essential";
        }
        if (matches(subject, relevant)) {
            return "Relevant";
        }
        if (matches(subject, desirable)) {
            return "Desirable";
        }
        return "Other";
    }

    private static boolean matches(String subject, List<String> declared) {
        if (subject == null || declared.isEmpty()) {
            return false;
        }
        return declared.stream().anyMatch(s -> s.equalsIgnoreCase(subject.trim()));
    }
}
