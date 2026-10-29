package org.nexus.napbackend.scoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

class GradeScaleTest {

    @ParameterizedTest
    @CsvSource({
            "D1, 6.0", "D2, 5.0", "C3, 4.0", "C4, 3.0",
            "C5, 2.0", "C6, 1.0", "P7, 0.5", "P8, 0.0"
    })
    @DisplayName("UCE grades map onto the 0-6 scale in rank order")
    void parsesUceGrades(String grade, double expected) {
        assertEquals(expected, GradeScale.parseUce(grade).orElse(-1), 1e-9);
    }

    @ParameterizedTest
    @CsvSource({
            "A, 6.0", "B, 5.0", "C, 4.0", "D, 3.0", "E, 2.0", "O, 1.0", "F, 0.0"
    })
    void parsesUaceLetterGrades(String grade, double expected) {
        assertEquals(expected, GradeScale.parseUace(grade).orElse(-1), 1e-9);
    }

    @ParameterizedTest
    @CsvSource({
            "A1, 6.0", "A2, 6.0", "A3, 6.0",
            "B2, 5.0", "B3, 5.0", "B4, 5.0", "B5, 5.0",
            "B6, 4.0", "B7, 4.0"
    })
    @DisplayName("Numeric UACE grades resolve to their band, matching the letter notation")
    void parsesUaceNumericGrades(String grade, double expected) {
        assertEquals(expected, GradeScale.parseUace(grade).orElse(-1), 1e-9);
    }

    @Test
    @DisplayName("A1 previously fell through to 0.0 via a failed integer parse")
    void a1IsRecognisedNotSilentlyZero() {
        assertTrue(GradeScale.parseUace("A1").isPresent());
        assertEquals(6.0, GradeScale.parseUace("A1").orElse(-1), 1e-9);
    }

    @Test
    @DisplayName("A1 scores the same as A, so both notations agree")
    void letterAndNumericNotationsAgree() {
        assertEquals(GradeScale.parseUace("A").orElseThrow(), GradeScale.parseUace("A1").orElseThrow(), 1e-9);
        assertEquals(GradeScale.parseUace("C").orElseThrow(), GradeScale.parseUace("B7").orElseThrow(), 1e-9);
    }

    @ParameterizedTest
    @CsvSource({"d1, 6.0", "c3, 4.0", "' P7 ', 0.5"})
    @DisplayName("O-level matching is case and whitespace tolerant")
    void normalisesUceInput(String raw, double expected) {
        assertEquals(expected, GradeScale.parseUce(raw).orElse(-1), 1e-9, "failed for input: " + raw);
    }

    @ParameterizedTest
    @CsvSource({"a1, 6.0", "b3, 5.0", "' E ', 2.0"})
    @DisplayName("A-level matching is case and whitespace tolerant")
    void normalisesUaceInput(String raw, double expected) {
        assertEquals(expected, GradeScale.parseUace(raw).orElse(-1), 1e-9, "failed for input: " + raw);
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   ", "Z9", "unknown", "A4", "B1", "B8", "!!"})
    @DisplayName("Unknown grades return empty rather than a silent zero")
    void rejectsUnknownGrades(String grade) {
        assertFalse(GradeScale.parseUce(grade).isPresent(), "UCE accepted: " + grade);
        assertFalse(GradeScale.parseUace(grade).isPresent(), "UACE accepted: " + grade);
    }

    @Test
    void nullGradeIsRejected() {
        assertFalse(GradeScale.parseUce(null).isPresent());
        assertFalse(GradeScale.parseUace(null).isPresent());
    }

    @Test
    @DisplayName("UCE ordering is strictly descending D1 through P8")
    void uceOrderingIsMonotonic() {
        String[] grades = {"D1", "D2", "C3", "C4", "C5", "C6", "P7", "P8"};
        double previous = Double.MAX_VALUE;
        for (String grade : grades) {
            double points = GradeScale.parseUce(grade).orElseThrow();
            assertTrue(points < previous, grade + " out of order");
            previous = points;
        }
    }

    @Test
    void passThresholdResolvesToPoints() {
        assertEquals(4.0, GradeScale.passThresholdPoints("C3").orElse(-1), 1e-9);
        assertEquals(3.0, GradeScale.passThresholdPoints("C4").orElse(-1), 1e-9);
        assertFalse(GradeScale.passThresholdPoints("not-a-grade").isPresent(),
                "a misconfigured threshold must surface as a configuration error");
    }

    @Test
    @DisplayName("The default pass mark is the permissive C6, not the stricter C3")
    void defaultPassGradeIsPermissive() {
        assertEquals("C6", ScoringPolicy.defaults().passThresholdGrade());
        assertEquals(1.0, ScoringPolicy.defaults().passThresholdPoints().orElse(-1), 1e-9);
    }
}
