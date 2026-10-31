package org.nexus.napbackend.scoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.nexus.napbackend.dto.AdmissionSchemeRequest;
import org.nexus.napbackend.dto.AdmissionSchemeResponse;
import org.nexus.napbackend.dto.ProgramRequest;
import org.nexus.napbackend.dto.ProgramResponse;
import org.nexus.napbackend.mapper.AdmissionSchemeMapper;
import org.nexus.napbackend.mapper.ProgramMapper;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.scoring.ScoringPolicyFactory;

/**
 * The new policy fields were on the entities but unreachable through the API, so
 * an officer had no way to set a cutoff index or a scheme weight even though the
 * scoring code read them. These tests cover the round trip.
 */
class ScoringConfigurationApiTest {

    /**
     * Builds a request carrying only the two fields under test.
     *
     * <p>{@code ProgramRequest} is a 40-component record, so the arguments are
     * grouped by the field ranges they fill and the ones that matter are named.
     */
    private static ProgramRequest programRequest(Double cutoffIndex, String essentialMinimumGrade) {
        return new ProgramRequest(
                "Engineering",                              // programName
                "ENG",                                      // programCode
                null, null, null, null, null, null,         // programType..careerOpportunities
                null, null, null, null, null,               // status..campus
                null, null, null, null, null, null,         // duration..totalCreditUnits
                null, null, null, null, null,               // studyMode..curriculum
                null, null, null, null, null,               // intakes..imageUrl
                null, null,                                 // featured..displayOrder
                25.0,                                       // cutoffScore
                cutoffIndex,                                // cutoffIndex
                essentialMinimumGrade,                      // essentialMinimumGrade
                "[\"Mathematics\"]",                         // essentialSubjects
                null,                                       // relevantSubjects
                null,                                       // desirableSubjects
                5,                                          // minimumUcePasses
                50,                                         // capacity
                "2026"                                      // intakeYear
        );
    }

    @Test
    @DisplayName("A programme's cutoff index and essential grade survive create and read")
    void programFieldsRoundTrip() {
        Program entity = ProgramMapper.toEntity(programRequest(72.5, "B"));

        assertEquals(72.5, entity.getCutoffIndex(), 1e-9);
        assertEquals("B", entity.getEssentialMinimumGrade());

        ProgramResponse response = ProgramMapper.toDto(entity, List.of("Engineering"));
        assertEquals(72.5, response.cutoffIndex(), 1e-9);
        assertEquals("B", response.essentialMinimumGrade());
    }

    @Test
    @DisplayName("A programme with no cutoff index keeps it null so applicants route to review")
    void unsetCutoffIndexStaysNull() {
        Program entity = ProgramMapper.toEntity(programRequest(null, null));

        assertNull(entity.getCutoffIndex(),
                "a zero cutoff would read as a real threshold of zero rather than an unset one");
        assertNull(ProgramMapper.toDto(entity, List.of()).cutoffIndex());
    }

    @Test
    @DisplayName("An update applies a cutoff index but an omitted field is left alone")
    void updateDoesNotClobberUnsetFields() {
        Program entity = ProgramMapper.toEntity(programRequest(70.0, "C"));
        ProgramMapper.updateEntity(entity, programRequest(85.0, "B"));
        assertEquals(85.0, entity.getCutoffIndex(), 1e-9);
        assertEquals("B", entity.getEssentialMinimumGrade());

        ProgramMapper.updateEntity(entity, programRequest(null, null));
        assertEquals(85.0, entity.getCutoffIndex(), 1e-9,
                "a partial update must not wipe the configured threshold");
        assertEquals("B", entity.getEssentialMinimumGrade());
    }

    @Test
    @DisplayName("A programme's configured cutoff and grade actually change the resolved policy")
    void programFieldsAffectPolicy() {
        Program lenient = new Program();
        lenient.setEssentialMinimumGrade("C");
        Program strict = new Program();
        strict.setEssentialMinimumGrade("B");

        ScoringPolicyFactory factory = new ScoringPolicyFactory();

        assertEquals("C", factory.resolve(lenient, null).essentialMinimumGrade());
        assertEquals("B", factory.resolve(strict, null).essentialMinimumGrade());
        assertEquals(GradeScale.parseUace("C").orElseThrow(),
                factory.resolve(lenient, null).essentialMinimumPoints().orElseThrow(), 1e-9);
    }

    private static AdmissionSchemeRequest schemeRequest(
            Double oWeight, Double aWeight, Integer bestOf, String passThreshold) {
        return new AdmissionSchemeRequest(
                "January 2027", "Direct Entry", "2027", "January", "desc", null, null,
                100, "1000", null, null, "OPEN", oWeight, aWeight, bestOf, passThreshold, List.of(1L));
    }

    @Test
    @DisplayName("A scheme's weights and thresholds survive create and read")
    void schemeFieldsRoundTrip() {
        AdmissionScheme entity = new AdmissionScheme();
        AdmissionSchemeMapper.applyRequest(entity, schemeRequest(30.0, 70.0, 6, "C5"));

        assertEquals(30.0, entity.getOLevelWeight(), 1e-9);
        assertEquals(70.0, entity.getALevelWeight(), 1e-9);
        assertEquals(6, entity.getBestOfOLevel());
        assertEquals("C5", entity.getPassGradeThreshold());

        AdmissionSchemeResponse response = AdmissionSchemeMapper.toDto(entity);
        assertEquals(30.0, response.oLevelWeight(), 1e-9);
        assertEquals(70.0, response.aLevelWeight(), 1e-9);
        assertEquals(6, response.bestOfOLevel());
        assertEquals("C5", response.passGradeThreshold());
    }

    @Test
    @DisplayName("An omitted weight falls back to the default rather than to zero")
    void omittedSchemeWeightKeepsTheDefault() {
        AdmissionScheme entity = new AdmissionScheme();
        AdmissionSchemeMapper.applyRequest(entity, schemeRequest(null, null, null, null));

        assertEquals(40.0, entity.getOLevelWeight(), 1e-9);
        assertEquals(60.0, entity.getALevelWeight(), 1e-9);
        assertEquals(8, entity.getBestOfOLevel());
        assertEquals("C6", entity.getPassGradeThreshold(),
                "C6 is the permissive pass mark; an omitted value must not tighten the gate");
    }

    @Test
    @DisplayName("A scheme's configured weights actually change the resolved policy")
    void schemeFieldsAffectPolicy() {
        AdmissionScheme scheme = new AdmissionScheme();
        scheme.setOLevelWeight(30.0);
        scheme.setALevelWeight(70.0);
        scheme.setBestOfOLevel(6);
        scheme.setPassGradeThreshold("C5");

        ScoringPolicy policy = new ScoringPolicyFactory().resolve(new Program(), scheme);

        assertEquals(30.0, policy.oLevelWeight(), 1e-9);
        assertEquals(70.0, policy.aLevelWeight(), 1e-9);
        assertEquals(6, policy.bestOfOLevelSubjects());
        assertEquals("C5", policy.passThresholdGrade());
    }

    @Test
    @DisplayName("Configuring only the O-level weight keeps the pair summing to 100")
    void halfConfiguredWeightsStillSumToOneHundred() {
        AdmissionScheme scheme = new AdmissionScheme();
        scheme.setOLevelWeight(25.0);
        scheme.setALevelWeight(null);

        ScoringPolicy policy = new ScoringPolicyFactory().resolve(new Program(), scheme);

        assertEquals(25.0, policy.oLevelWeight(), 1e-9);
        assertEquals(75.0, policy.aLevelWeight(), 1e-9);
        assertEquals(100.0, policy.oLevelWeight() + policy.aLevelWeight(), 1e-9);
    }

    @Test
    @DisplayName("An unusable pass threshold is surfaced rather than silently ignored")
    void invalidPassThresholdIsVisible() {
        AdmissionScheme scheme = new AdmissionScheme();
        scheme.setPassGradeThreshold("NOT_A_GRADE");

        ScoringPolicy policy = new ScoringPolicyFactory().resolve(new Program(), scheme);

        assertNotNull(policy.passThresholdGrade());
        assertEquals("NOT_A_GRADE", policy.passThresholdGrade());
        assertEquals(false, policy.passThresholdPoints().isPresent(),
                "an unresolvable threshold must not resolve to a pass mark of zero");
    }
}
