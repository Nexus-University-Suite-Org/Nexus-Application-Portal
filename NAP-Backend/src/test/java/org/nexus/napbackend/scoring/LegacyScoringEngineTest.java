package org.nexus.napbackend.scoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.nexus.napbackend.dto.QualificationResult;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;

/**
 * Pins the legacy arithmetic so {@code LEGACY} mode stays a true no-op.
 *
 * <p>These tests assert behaviour that is known to be wrong on purpose. They are
 * not endorsements and must not be "fixed": if one of them starts failing after a
 * change to {@link LegacyScoringEngine}, the change has altered what a
 * {@code LEGACY} deployment would do to a real applicant, and the safety of the
 * rollback path is gone.
 */
class LegacyScoringEngineTest {

    private final LegacyScoringEngine engine = new LegacyScoringEngine();

    private static Application application(String gender, String oLevel, String aLevel) {
        Application app = new Application();
        app.setGender(gender);
        app.setOLevelSubjects(oLevel);
        app.setUacePrincipalSubjects(aLevel);
        return app;
    }

    private static Program programme(Double cutoff) {
        Program programme = new Program();
        programme.setProgramCode("ENG");
        programme.setProgramName("Engineering");
        programme.setCutoffScore(cutoff);
        programme.setEssentialSubjects("[\"Mathematics\",\"Physics\"]");
        programme.setRelevantSubjects("[\"Chemistry\"]");
        programme.setDesirableSubjects("[\"Technical Drawing\"]");
        return programme;
    }

    @Test
    @DisplayName("Essential subjects score triple, relevant double, desirable single, others half")
    void appliesLegacySubjectWeights() {
        Application app = application("Male",
                "[]",
                "[{\"subject\":\"Mathematics\",\"grade\":\"A\"},"
                        + "{\"subject\":\"Chemistry\",\"grade\":\"B\"},"
                        + "{\"subject\":\"Technical Drawing\",\"grade\":\"C\"},"
                        + "{\"subject\":\"Agriculture\",\"grade\":\"A\"}]");

        QualificationResult result = engine.evaluate(app, programme(0.0));

        // 6*3 + 5*2 + 4*1 + 6*0.5 = 35
        assertEquals(35.0, result.totalScore(), 1e-9);
    }

    @Test
    @DisplayName("The 1.5 point female applicant bonus is preserved for parity")
    void preservesGenderBonus() {
        Application male = application("Male", "[]", "[{\"subject\":\"Mathematics\",\"grade\":\"A\"}]");
        Application female = application("Female", "[]", "[{\"subject\":\"Mathematics\",\"grade\":\"A\"}]");

        assertEquals(18.0, engine.evaluate(male, programme(0.0)).totalScore(), 1e-9);
        assertEquals(18.0, engine.evaluate(female, programme(0.0)).totalScore(), 1e-9,
                "the bonus is added to the adjusted score, not the total");
        assertEquals(19.5, engine.evaluate(female, programme(0.0)).adjustedScore(), 1e-9);
        assertTrue(engine.evaluate(female, programme(0.0)).genderBonus());
    }

    @Test
    @DisplayName("A null cutoff defaults to zero and admits everybody")
    void nullCutoffAdmitsEverybody() {
        // This is the defect that motivated the revision. It must stay exactly as
        // it was while the deployment is in LEGACY mode, otherwise switching to
        // ENFORCE cannot be told apart from a behaviour change.
        Application app = application("Male", "[]", "[{\"subject\":\"Mathematics\",\"grade\":\"F\"}]");

        LegacyScoringEngine.LegacyEvaluation legacy = engine.evaluateWithOutcome(app, programme(null));

        assertEquals(0.0, legacy.result().cutoffScore(), 1e-9);
        assertTrue(legacy.result().qualified());
        assertEquals(AdmissionOutcome.ADMIT, legacy.outcome(),
                "the legacy engine had no REVIEW outcome and admitted on a zero cutoff");
    }

    @Test
    @DisplayName("Legacy outcome is ADMIT or REJECT only, never REVIEW")
    void legacyNeverProducesReview() {
        Application app = application("Male", "[]", "[{\"subject\":\"Mathematics\",\"grade\":\"F\"}]");

        assertEquals(AdmissionOutcome.REJECT,
                engine.evaluateWithOutcome(app, programme(50.0)).outcome());
    }

    @Test
    @DisplayName("Malformed subject JSON scores zero rather than raising")
    void malformedJsonScoresZero() {
        Application app = application("Male", "not json at all", "{{{");

        QualificationResult result = engine.evaluate(app, programme(0.0));

        assertEquals(0.0, result.totalScore(), 1e-9);
        assertTrue(result.qualified(), "a zero total still clears a zero cutoff");
    }

    @Test
    @DisplayName("Numeric UACE grades score 6-(n-1), and letter-numbered grades score zero")
    void legacyNumericGradeHandling() {
        Application numeric = application("Male", "[]",
                "[{\"subject\":\"Mathematics\",\"grade\":\"3\"},{\"subject\":\"Physics\",\"grade\":\"1\"}]");
        // 4*3 + 6*3 = 30
        assertEquals(30.0, engine.evaluate(numeric, programme(0.0)).totalScore(), 1e-9);

        Application mixed = application("Male", "[]",
                "[{\"subject\":\"Mathematics\",\"grade\":\"A1\"}]");
        assertEquals(0.0, engine.evaluate(mixed, programme(0.0)).totalScore(), 1e-9,
                "A1 is not a number, so the original scored it zero");
    }

    @Test
    @DisplayName("Only the best eight O-level subjects count")
    void countsBestEightOLevelSubjects() {
        String subjects = "[{\"subject\":\"S1\",\"grade\":\"D1\"},{\"subject\":\"S2\",\"grade\":\"D1\"},"
                + "{\"subject\":\"S3\",\"grade\":\"D1\"},{\"subject\":\"S4\",\"grade\":\"D1\"},"
                + "{\"subject\":\"S5\",\"grade\":\"D1\"},{\"subject\":\"S6\",\"grade\":\"D1\"},"
                + "{\"subject\":\"S7\",\"grade\":\"D1\"},{\"subject\":\"S8\",\"grade\":\"D1\"},"
                + "{\"subject\":\"S9\",\"grade\":\"D1\"}]";

        assertEquals(2.4, engine.calculateOLevelWeight(subjects), 1e-9);
    }

    @Test
    @DisplayName("The breakdown keeps the per-subject points the officers saw")
    void exposesSubjectBreakdown() {
        Application app = application("Male", "[]",
                "[{\"subject\":\"Mathematics\",\"grade\":\"A\"},{\"subject\":\"Agriculture\",\"grade\":\"C\"}]");

        QualificationResult result = engine.evaluate(app, programme(0.0));

        assertEquals(2, result.breakdown().size());
        assertEquals("Essential", result.breakdown().get(0).category());
        assertEquals(6.0, result.breakdown().get(0).gradePoints(), 1e-9);
        assertEquals(3.0, result.breakdown().get(0).weight(), 1e-9);
        assertEquals("Other", result.breakdown().get(1).category());
        assertEquals(0.5, result.breakdown().get(1).weight(), 1e-9);
    }

    @Test
    @DisplayName("A blank applicant record does not blow up the legacy path")
    void handlesMissingData() {
        Application empty = application(null, null, null);

        LegacyScoringEngine.LegacyEvaluation legacy = engine.evaluateWithOutcome(empty, programme(0.0));

        assertEquals(0.0, legacy.result().totalScore(), 1e-9);
        assertFalse(legacy.result().genderBonus());
        assertEquals(AdmissionOutcome.ADMIT, legacy.outcome());
    }
}
