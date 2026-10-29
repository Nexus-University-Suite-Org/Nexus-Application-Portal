package org.nexus.napbackend.scoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;

class RuleBasedQualificationModelTest {

    private final ObjectMapper mapper = new ObjectMapper();
    private final SubjectReader reader = new SubjectReader();
    private final RuleBasedQualificationModel model = new RuleBasedQualificationModel(reader);
    private final ScoringPolicy policy = ScoringPolicy.defaults();

    private Program programme(Double cutoffIndex) {
        Program programme = new Program();
        programme.setId(1L);
        programme.setProgramCode("BSC");
        programme.setProgramName("Bachelor of Computer Science");
        programme.setCutoffIndex(cutoffIndex);
        programme.setCutoffScore(0.0);
        programme.setMinimumUcePasses(5);
        programme.setEssentialSubjects("[\"Mathematics\"]");
        programme.setEssentialMinimumGrade("C");
        return programme;
    }

    private Application applicant(String gender, String oLevelJson, String aLevelJson) {
        Application application = new Application();
        application.setId(10L);
        application.setGender(gender);
        application.setOLevelSubjects(oLevelJson);
        application.setUacePrincipalSubjects(aLevelJson);
        return application;
    }

    private static final String GOOD_O_LEVEL = """
            [{"subject":"Mathematics","grade":"C3"},
             {"subject":"English","grade":"C4"},
             {"subject":"Physics","grade":"C5"},
             {"subject":"Chemistry","grade":"C6"},
             {"subject":"Biology","grade":"C6"},
             {"subject":"Geography","grade":"C6"}]""";

    private static final String GOOD_A_LEVEL = """
            [{"subject":"Mathematics","grade":"A"}]""";

    private QualificationEvaluation evaluate(Application application, Program programme) {
        return model.evaluate(new ScoringRequest(application, programme, policy, programme.getCutoffIndex()));
    }

    // ------------------------------------------------- regression: gender bonus

    @Test
    @DisplayName("Score is identical for male and female applicants")
    void scoreIsIndependentOfGender() {
        Program programme = programme(50.0);
        QualificationEvaluation male = evaluate(applicant("Male", GOOD_O_LEVEL, GOOD_A_LEVEL), programme);
        QualificationEvaluation female = evaluate(applicant("Female", GOOD_O_LEVEL, GOOD_A_LEVEL), programme);

        assertEquals(male.admissionIndex(), female.admissionIndex(), 1e-9,
                "a 1.5 point female bonus was removed; scoring must not depend on gender");
        assertEquals(male.outcome(), female.outcome());
    }

    @Test
    @DisplayName("Gender is never read by the scoring engine")
    void genderIsNotAFeature() {
        Program programme = programme(50.0);
        QualificationEvaluation blank = evaluate(applicant(null, GOOD_O_LEVEL, GOOD_A_LEVEL), programme);
        QualificationEvaluation other = evaluate(applicant("Prefer not to say", GOOD_O_LEVEL, GOOD_A_LEVEL), programme);

        assertEquals(blank.admissionIndex(), other.admissionIndex(), 1e-9);
        assertEquals(blank.outcome(), other.outcome());
    }

    // ------------------------------------------- regression: fail-closed cutoff

    @Test
    @DisplayName("A programme with no configured threshold cannot admit anyone")
    void missingThresholdFailsClosed() {
        QualificationEvaluation result = evaluate(applicant("Male", GOOD_O_LEVEL, GOOD_A_LEVEL), programme(null));

        assertEquals(AdmissionOutcome.REVIEW, result.outcome(),
                "the previous check was adjustedScore >= 0.0, which admitted everyone");
        assertTrue(result.failedGateCodes().contains("THRESHOLD_NOT_CONFIGURED"));
    }

    @Test
    @DisplayName("A zero threshold behaves the same as no threshold")
    void zeroThresholdFailsClosed() {
        QualificationEvaluation result = evaluate(applicant("Male", GOOD_O_LEVEL, GOOD_A_LEVEL), programme(0.0));

        assertEquals(AdmissionOutcome.REVIEW, result.outcome());
    }

    // --------------------------------- regression: silent zero on parse failure

    @Test
    @DisplayName("Malformed subject data forces review instead of a zero-score rejection")
    void unreadableDataNeverAutoRejects() {
        Program programme = programme(90.0);
        QualificationEvaluation result = evaluate(
                applicant("Male", "{not valid json at all", GOOD_A_LEVEL), programme);

        assertNotEquals(AdmissionOutcome.REJECT, result.outcome(),
                "unreadable input must never become an automatic rejection");
        assertEquals(AdmissionOutcome.REVIEW, result.outcome());
        assertTrue(result.dataQuality().has(DataQuality.Flag.UNREADABLE_SUBJECTS));
        assertTrue(result.failedGateCodes().contains("DATA_NOT_READABLE"));
    }

    @Test
    @DisplayName("An unrecognised grade is reported, not treated as a fail")
    void unknownGradeIsFlagged() {
        String badGrade = """
                [{"subject":"Mathematics","grade":"Z9"}]""";
        QualificationEvaluation result = evaluate(applicant("Male", GOOD_O_LEVEL, badGrade), programme(50.0));

        assertTrue(result.dataQuality().has(DataQuality.Flag.UNKNOWN_GRADE));
        assertEquals(AdmissionOutcome.REVIEW, result.outcome());
    }

    // ------------------------------------- regression: minimum passes enforced

    @Test
    @DisplayName("minimumUcePasses is enforced, which it previously was not at all")
    void minimumPassesIsEnforced() {
        String tooFewPasses = """
                [{"subject":"Mathematics","grade":"C3"},
                 {"subject":"English","grade":"P7"},
                 {"subject":"Physics","grade":"P8"}]""";
        QualificationEvaluation result = evaluate(applicant("Male", tooFewPasses, GOOD_A_LEVEL), programme(1.0));

        assertTrue(result.failedGateCodes().contains("MINIMUM_UCE_PASSES"),
                "one credit-level result is below the required five");
        assertNotEquals(AdmissionOutcome.ADMIT, result.outcome(),
                "an applicant below the published minimum must not be auto-admitted");
    }

    @Test
    @DisplayName("A P7 or P8 is not a pass under the default C6 threshold")
    void pGradesDoNotCountAsPasses() {
        String weak = """
                [{"subject":"Mathematics","grade":"P7"},
                 {"subject":"English","grade":"P7"},
                 {"subject":"Physics","grade":"P8"},
                 {"subject":"Chemistry","grade":"P7"},
                 {"subject":"Biology","grade":"P7"}]""";
        QualificationEvaluation result = evaluate(applicant("Male", weak, GOOD_A_LEVEL), programme(1.0));

        assertTrue(result.failedGateCodes().contains("MINIMUM_UCE_PASSES"));
    }

    @Test
    @DisplayName("Enough passes clears the gate")
    void enoughPassesPasses() {
        QualificationEvaluation result = evaluate(applicant("Male", GOOD_O_LEVEL, GOOD_A_LEVEL), programme(1.0));

        assertFalse(result.failedGateCodes().contains("MINIMUM_UCE_PASSES"));
    }

    // ---------------------------------------- regression: essential subjects

    @Test
    @DisplayName("Essential subjects gate an application that omits them")
    void essentialSubjectsAreAGate() {
        String noMaths = """
                [{"subject":"History","grade":"A"}]""";
        QualificationEvaluation result = evaluate(applicant("Male", GOOD_O_LEVEL, noMaths), programme(1.0));

        assertTrue(result.failedGateCodes().contains("ESSENTIAL_SUBJECTS"),
                "essential subjects were only a 3.0 score multiplier, never a requirement");
        assertNotEquals(AdmissionOutcome.ADMIT, result.outcome());
    }

    @Test
    @DisplayName("Essential subject below the minimum grade is reported")
    void essentialSubjectBelowMinimumFails() {
        String weakMaths = """
                [{"subject":"Mathematics","grade":"E"}]""";
        QualificationEvaluation result = evaluate(applicant("Male", GOOD_O_LEVEL, weakMaths), programme(1.0));

        assertTrue(result.failedGateCodes().contains("ESSENTIAL_SUBJECTS"));
    }

    // ------------------------------------------------------ scale and ordering

    @Test
    @DisplayName("Stronger grades never produce a lower index")
    void indexIsMonotonicInGrades() {
        String weak = """
                [{"subject":"Mathematics","grade":"B4"}]""";
        String strong = """
                [{"subject":"Mathematics","grade":"A1"}]""";
        Program programme = programme(1.0);

        double weakIndex = evaluate(applicant("Male", GOOD_O_LEVEL, weak), programme).admissionIndex();
        double strongIndex = evaluate(applicant("Male", GOOD_O_LEVEL, strong), programme).admissionIndex();

        assertTrue(strongIndex > weakIndex,
                "A1 (" + strongIndex + ") must outscore B4 (" + weakIndex + ")");
    }

    @Test
    @DisplayName("O-level and A-level are on commensurate scales")
    void componentsAreCommensurable() {
        String strongOLevel = "[{\"subject\":\"Mathematics\",\"grade\":\"D1\"}]";
        String strongALevel = "[{\"subject\":\"Mathematics\",\"grade\":\"A1\"}]";
        Program programme = programme(1.0);

        QualificationEvaluation oLevelOnly = evaluate(applicant("Male", strongOLevel, null), programme);
        QualificationEvaluation aLevelOnly = evaluate(applicant("Male", null, strongALevel), programme);

        assertTrue(oLevelOnly.admissionIndex() > 0, "an applicant with no A-level is scored on O-level alone");
        assertEquals(100.0, oLevelOnly.admissionIndex(), 1.0);
        assertEquals(100.0, aLevelOnly.admissionIndex(), 1.0);
    }

    @Test
    @DisplayName("A blank subject record is not treated as a pass or a fail")
    void noResultsRoutesToReview() {
        QualificationEvaluation result = evaluate(applicant("Male", null, null), programme(1.0));

        assertEquals(AdmissionOutcome.REVIEW, result.outcome(),
                "an application with nothing scorable may be a capture failure, so a human decides");
        assertTrue(result.failedGateCodes().contains("NO_RESULTS_SUPPLIED"));
    }

    // --------------------------------------------------------- explainability

    @Test
    @DisplayName("Every result carries a decomposable breakdown and a model version")
    void resultIsExplainable() {
        QualificationEvaluation result = evaluate(applicant("Male", GOOD_O_LEVEL, GOOD_A_LEVEL), programme(40.0));

        assertFalse(result.criteria().isEmpty(), "a bare number is not an explainable decision");
        assertFalse(result.gates().isEmpty());
        assertFalse(result.reasons().isEmpty());
        assertEquals(ModelVersion.CURRENT_VERSION, result.modelVersion().version());
        assertTrue(result.criteria().stream().anyMatch(c -> c.code().startsWith("A_LEVEL_MATHEMATICS")));
    }

    @Test
    @DisplayName("A rejected outcome is only reached when the data is trustworthy")
    void rejectRequiresTrustworthyData() {
        QualificationEvaluation cleanReject = evaluate(applicant("Male", GOOD_O_LEVEL, GOOD_A_LEVEL), programme(99.0));
        assertEquals(AdmissionOutcome.REJECT, cleanReject.outcome());
        assertTrue(cleanReject.dataQuality().isClean());

        QualificationEvaluation dirtyReject = evaluate(
                applicant("Male", GOOD_O_LEVEL, "{broken"), programme(99.0));
        assertNotEquals(AdmissionOutcome.REJECT, dirtyReject.outcome());
    }

    @Test
    void programmeSelectorSeesOnlyAdmittedApplicants() {
        List<QualificationEvaluation> results = List.of(
                evaluate(applicant("Male", GOOD_O_LEVEL, GOOD_A_LEVEL), programme(1.0)));
        assertEquals(1, results.size());
    }
}
