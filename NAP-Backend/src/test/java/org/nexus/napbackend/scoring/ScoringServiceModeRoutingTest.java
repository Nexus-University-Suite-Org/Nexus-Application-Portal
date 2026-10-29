package org.nexus.napbackend.scoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.nexus.napbackend.dto.QualificationResult;
import org.nexus.napbackend.model.AdmissionDecision;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.repository.AdmissionDecisionRepository;

/**
 * Pins the rollout semantics, which are the whole point of the mode setting.
 *
 * <p>Before this was wired, {@code ADMISSION_SCORING_MODE} was read into a field
 * and never consulted, so the new engine governed every applicant while the
 * configuration claimed the legacy one was active. These tests fail if the mode
 * stops mattering again.
 */
class ScoringServiceModeRoutingTest {

    private final QualificationModel model = mock(QualificationModel.class);
    private final AdmissionDecisionRepository decisionRepository = mock(AdmissionDecisionRepository.class);
    private final ScoringPolicyFactory policyFactory = new ScoringPolicyFactory();
    private final LegacyScoringEngine legacyEngine = new LegacyScoringEngine();

    private ScoringService serviceIn(String mode) {
        return new ScoringService(model, policyFactory, legacyEngine, decisionRepository, mode);
    }

    private static Application application() {
        Application app = new Application();
        app.setId(1L);
        app.setTenantId(1L);
        app.setGender("Male");
        app.setProgramChoice1("ENG");
        app.setOLevelSubjects("[{\"subject\":\"Mathematics\",\"grade\":\"C6\"},{\"subject\":\"English\",\"grade\":\"C6\"},"
                + "{\"subject\":\"Physics\",\"grade\":\"C6\"},{\"subject\":\"Chemistry\",\"grade\":\"C6\"},"
                + "{\"subject\":\"Biology\",\"grade\":\"C6\"},{\"subject\":\"Geography\",\"grade\":\"C6\"}]");
        app.setUacePrincipalSubjects("[{\"subject\":\"Mathematics\",\"grade\":\"A\"},{\"subject\":\"Physics\",\"grade\":\"B\"}]");
        return app;
    }

    private static Program programme() {
        Program programme = new Program();
        programme.setId(10L);
        programme.setProgramCode("ENG");
        programme.setProgramName("Engineering");
        programme.setCutoffScore(25.0);
        programme.setCutoffIndex(70.0);
        programme.setEssentialSubjects("[\"Mathematics\",\"Physics\"]");
        programme.setCapacity(2);
        return programme;
    }

    /**
     * The legacy total for {@link #application()} against {@link #programme()}:
     * six C6 O-level subjects at 0.2 (1.2) plus A-level Mathematics A and Physics
     * B as essential subjects (6*3 + 5*3 = 33), totalling 34.2 and clearing the
     * 25.0 cutoff.
     */
    private static final double LEGACY_TOTAL = 34.2;

    /** A strong applicant the new engine admits and the legacy engine also admits. */
    private void stubAdmittingModel() {
        when(model.evaluate(any())).thenReturn(new QualificationEvaluation(
                "ENG", "Engineering", AdmissionOutcome.ADMIT, 82.0, 78.0, 85.0,
                25.5, 25.0, List.of(), List.of(),
                new DataQuality(java.util.Set.of()),
                new ModelVersion("test", "2026-01-01", "test fixture"), List.of("meets the standard")));
    }

    @Test
    @DisplayName("LEGACY mode returns the legacy arithmetic to the applicant")
    void legacyModeReturnsLegacyResult() {
        stubAdmittingModel();
        Program programme = programme();

        QualificationResult result = serviceIn("LEGACY").qualificationResult(application(), programme, null);

        assertTrue(result.qualified());
        assertEquals(LEGACY_TOTAL, result.totalScore(), 1e-9,
                "LEGACY must show the old total score, not the new index");
        verify(model, never()).evaluate(any());
    }

    @Test
    @DisplayName("SHADOW mode is invisible to the applicant")
    void shadowModeAlsoReturnsLegacyResult() {
        stubAdmittingModel();
        Program programme = programme();

        QualificationResult shadow = serviceIn("SHADOW").qualificationResult(application(), programme, null);
        QualificationResult legacy = serviceIn("LEGACY").qualificationResult(application(), programme, null);

        assertEquals(legacy, shadow,
                "the only difference between LEGACY and SHADOW is that SHADOW also records the new opinion");
    }

    @Test
    @DisplayName("ENFORCE mode returns the new engine's index and outcome")
    void enforceModeReturnsNewResult() {
        stubAdmittingModel();
        Program programme = programme();

        QualificationResult result = serviceIn("ENFORCE").qualificationResult(application(), programme, null);

        assertTrue(result.qualified());
        assertEquals(82.0, result.totalScore(), 1e-9, "the new index replaces the old total");
        verify(model).evaluate(any());
    }

    @Test
    @DisplayName("An applicant needing review is not rendered as rejected under ENFORCE")
    void enforceDoesNotShowReviewAsRejection() {
        when(model.evaluate(any())).thenReturn(new QualificationEvaluation(
                "ENG", "Engineering", AdmissionOutcome.REVIEW, 61.0, 60.0, 62.0,
                25.5, 25.0, List.of(), List.of(),
                new DataQuality(java.util.Set.of(DataQuality.Flag.MISSING_SUBJECTS)),
                new ModelVersion("test", "2026-01-01", "test fixture"), List.of("incomplete results")));

        QualificationResult result = serviceIn("ENFORCE").qualificationResult(application(), programme(), null);

        assertTrue(result.qualified(),
                "'qualified' is the only place the wire shape can carry REVIEW, so it must not read as a rejection");
    }

    @Test
    @DisplayName("A failure in the new engine cannot break an ENFORCE decision")
    void enforceFallsBackToLegacyWhenNewEngineThrows() {
        when(model.evaluate(any())).thenThrow(new IllegalStateException("boom"));

        QualificationResult result = serviceIn("ENFORCE").qualificationResult(application(), programme(), null);

        assertNotNull(result, "the applicant must still get a decision");
        assertEquals(LEGACY_TOTAL, result.totalScore(), 1e-9);
    }

    @Test
    @DisplayName("Decisions are recorded in every mode, not just shadow runs")
    void recordsDecisionsInEveryMode() {
        stubAdmittingModel();
        Application app = application();
        Program programme = programme();

        for (String mode : List.of("LEGACY", "SHADOW", "ENFORCE")) {
            serviceIn(mode).evaluateAndRecord(app, List.of(programme), null);
        }

        var saved = org.mockito.ArgumentCaptor.forClass(AdmissionDecision.class);
        verify(decisionRepository, org.mockito.Mockito.times(3)).save(saved.capture());
        assertEquals(List.of("LEGACY", "SHADOW", "ENFORCE"),
                saved.getAllValues().stream().map(AdmissionDecision::getScoringMode).toList());
    }

    @Test
    @DisplayName("The stored outcome is what actually happened, not the new engine's opinion")
    void storedOutcomeReflectsTheDecisionOfRecord() {
        stubAdmittingModel();
        Application app = application();
        Program programme = programme();
        programme.setCutoffScore(1000.0); // the legacy engine would reject

        serviceIn("SHADOW").evaluateAndRecord(app, List.of(programme), null);

        var saved = org.mockito.ArgumentCaptor.forClass(AdmissionDecision.class);
        verify(decisionRepository).save(saved.capture());
        assertEquals(AdmissionOutcome.REJECT.name(), saved.getValue().getOutcome(),
                "in shadow the legacy decision stands");
        assertEquals(82.0, saved.getValue().getAdmissionIndex(), 1e-9,
                "but the new opinion is still stored for the calibration set");
    }

    @Test
    @DisplayName("ENFORCE stores the new engine's outcome as the outcome")
    void enforceStoresNewOutcome() {
        when(model.evaluate(any())).thenReturn(new QualificationEvaluation(
                "ENG", "Engineering", AdmissionOutcome.ADMIT, 82.0, 78.0, 85.0,
                25.5, 25.0, List.of(), List.of(),
                new DataQuality(java.util.Set.of()),
                new ModelVersion("test", "2026-01-01", "test fixture"), List.of("ok")));

        serviceIn("ENFORCE").evaluateAndRecord(application(), List.of(programme()), null);

        var saved = org.mockito.ArgumentCaptor.forClass(AdmissionDecision.class);
        verify(decisionRepository).save(saved.capture());
        assertEquals(AdmissionOutcome.ADMIT.name(), saved.getValue().getOutcome());
    }

    @Test
    @DisplayName("Only programmes the applicant actually chose are scored")
    void ignoresUnchosenProgrammes() {
        stubAdmittingModel();
        Program other = programme();
        other.setId(11L);
        other.setProgramCode("MED");
        other.setProgramName("Medicine");

        serviceIn("ENFORCE").evaluateAndRecord(application(), List.of(programme(), other), null);

        var saved = org.mockito.ArgumentCaptor.forClass(AdmissionDecision.class);
        verify(decisionRepository).save(saved.capture());
        assertEquals("ENG", saved.getValue().getProgrammeCode());
    }

    @Test
    @DisplayName("A record that cannot be written does not stop the decision being returned")
    void survivesARepositoryFailure() {
        when(model.evaluate(any())).thenThrow(new IllegalStateException("boom"));
        when(decisionRepository.save(any())).thenThrow(new RuntimeException("db down"));

        List<QualificationEvaluation> evaluations =
                serviceIn("ENFORCE").evaluateAndRecord(application(), List.of(programme()), null);

        assertTrue(evaluations.isEmpty());
        assertFalse(serviceIn("ENFORCE").qualificationResult(application(), programme(), null) == null,
                "the officer-facing result must still be produced");
    }

    @Test
    @DisplayName("An unrecognised mode falls back to LEGACY rather than throwing at startup")
    void unknownModeFallsBackToLegacy() {
        assertEquals(ScoringMode.LEGACY, ScoringMode.from("NONSENSE"));
        assertEquals(ScoringMode.LEGACY, ScoringMode.from(null));
        assertEquals(ScoringMode.LEGACY, ScoringMode.from("  "));
        assertEquals(ScoringMode.SHADOW, ScoringMode.from(" shadow "));
    }

    @Test
    @DisplayName("The auto-assign outcome tells REVIEW apart from ADMIT")
    void outcomeOfDistinguishesReviewFromAdmit() {
        when(model.evaluate(any())).thenReturn(new QualificationEvaluation(
                "ENG", "Engineering", AdmissionOutcome.REVIEW, 61.0, 60.0, 62.0,
                34.2, 25.0, List.of(), List.of(),
                new DataQuality(java.util.Set.of(DataQuality.Flag.MISSING_SUBJECTS)),
                new ModelVersion("test", "2026-01-01", "test fixture"), List.of("incomplete")));

        AdmissionOutcome outcome = serviceIn("ENFORCE").outcomeOf(application(), programme(), null);

        assertEquals(AdmissionOutcome.REVIEW, outcome,
                "a REVIEW applicant must not be auto-assigned a place, even though the wire shape "
                        + "reports them as qualified");
    }

    @Test
    @DisplayName("A failing engine cannot make an applicant auto-assignable")
    void outcomeOfFallsBackRatherThanThrowing() {
        when(model.evaluate(any())).thenThrow(new IllegalStateException("boom"));

        assertEquals(AdmissionOutcome.ADMIT,
                serviceIn("ENFORCE").outcomeOf(application(), programme(), null),
                "the legacy decision stands, and the applicant is not dropped by an engine fault");
    }
}
