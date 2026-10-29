package org.nexus.napbackend.scoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.nexus.napbackend.dto.QualificationResult;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;

class QualificationResultCompatibilityTest {

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * The exact shape written by the pre-revision engine, captured before any of
     * this change. applications.qualification_results is a text column that
     * already holds rows in this form, and ApplicationFacade still reads it back,
     * so it must keep deserialising.
     */
    private static final String LEGACY_ROW = """
            [{
              "programmeCode": "BSC",
              "programmeName": "Bachelor of Computer Science",
              "qualified": true,
              "totalScore": 34.5,
              "adjustedScore": 36.0,
              "genderBonus": true,
              "cutoffScore": 34.0,
              "oLevelScore": 2.4,
              "aLevelScore": 32.1,
              "breakdown": [
                {"subject":"Mathematics","grade":"A","category":"Essential",
                 "gradePoints":6.0,"weight":3.0,"weightedPoints":18.0}
              ],
              "reason": "Score 34.5 + 1.5 female applicant bonus = 36.0 meets cutoff of 34.0"
            }]""";

    @Test
    @DisplayName("Rows written by the old engine still deserialise")
    void legacyRowsStillDeserialise() throws Exception {
        List<QualificationResult> results = mapper.readValue(
                LEGACY_ROW, new TypeReference<List<QualificationResult>>() {
                });

        assertEquals(1, results.size());
        QualificationResult row = results.get(0);
        assertEquals("BSC", row.programmeCode());
        assertTrue(row.qualified());
        assertEquals(34.5, row.totalScore(), 1e-9);
        assertEquals(36.0, row.adjustedScore(), 1e-9);
        assertEquals(1, row.breakdown().size());
    }

    @Test
    @DisplayName("A legacy row still yields the max score the facade reads")
    void legacyMaxScoreStillComputes() throws Exception {
        List<QualificationResult> results = mapper.readValue(
                LEGACY_ROW, new TypeReference<List<QualificationResult>>() {
                });

        double max = results.stream().mapToDouble(QualificationResult::adjustedScore).max().orElse(0);
        assertEquals(36.0, max, 1e-9);
    }

    @Test
    @DisplayName("The new evaluation serialises for the decision log")
    void newEvaluationSerialises() {
        Application probe = new Application();
        probe.setId(1L);
        probe.setOLevelSubjects("[{\"subject\":\"Mathematics\",\"grade\":\"C3\"}]");

        SubjectReader reader = new SubjectReader();
        RuleBasedQualificationModel model = new RuleBasedQualificationModel(reader);

        Program programme = new Program();
        programme.setProgramCode("BSC");
        programme.setProgramName("Bachelor of Computer Science");
        programme.setCutoffIndex(50.0);

        QualificationEvaluation evaluation = model.evaluate(
                new ScoringRequest(probe, programme, ScoringPolicy.defaults(), 50.0));

        String json = assertDoesNotThrowSerialise(evaluation);
        assertTrue(json.contains("admissionIndex"));
        assertTrue(json.contains("criteria"));
        assertTrue(json.contains("gates"));
    }

    private String assertDoesNotThrowSerialise(Object value) {
        try {
            return mapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new AssertionError("evaluation failed to serialise: " + e.getMessage(), e);
        }
    }
}
