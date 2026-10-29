package org.nexus.napbackend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.nexus.napbackend.model.AdmissionDecision;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.repository.AdmissionDecisionRepository;
import org.nexus.napbackend.repository.ApplicationRepository;
import org.nexus.napbackend.repository.ProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Proves the scoring path actually writes rows, against a real database.
 *
 * <p>The unit tests mock the repository, so they cannot catch a constraint
 * violation, a missing column, or a tenant that does not exist. This test exists
 * because "the decision was recorded" is the claim the whole calibration
 * strategy rests on, and it had never been executed end to end.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AdmissionDecisionPersistenceTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Built rather than injected: this application runs Jackson 3, so there is no
     * {@code com.fasterxml.jackson.databind.ObjectMapper} bean to autowire.
     */
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private AdmissionDecisionRepository decisionRepository;

    private Program seedProgramme(String code) {
        Program programme = new Program();
        programme.setProgramCode(code);
        programme.setProgramName("Persistence Test Programme " + code);
        programme.setProgramType("Bachelor");
        programme.setStatus("Active");
        programme.setCutoffScore(25.0);
        programme.setCutoffIndex(70.0);
        programme.setEssentialMinimumGrade("C");
        programme.setMinimumUcePasses(5);
        programme.setCapacity(10);
        programme.setIntakeYear("2026");
        return programRepository.saveAndFlush(programme);
    }

    private Application createAndVerifyApplicant(String programmeCode) throws Exception {
        // Note the JSON key is "program", not "programChoice1":
        // ApplicationCreateRequest binds it via @JsonProperty("program"). Using the
        // entity field name here silently leaves the choice null, which makes the
        // applicant match no programme and look like a scoring bug.
        String payload = """
                {
                    "firstName": "Persistence",
                    "lastName": "Applicant",
                    "email": "persistence.applicant@example.com",
                    "phoneNumber": "+256700000001",
                    "gender": "Male",
                    "nationality": "Ugandan",
                    "district": "Kampala",
                    "program": "%s",
                    "studyMode": "Full Time",
                    "academicYear": "2026",
                    "semester": "1",
                    "oLevelSubjects": [
                        {"subject": "Mathematics", "grade": "C6"},
                        {"subject": "English", "grade": "C6"},
                        {"subject": "Physics", "grade": "C6"},
                        {"subject": "Chemistry", "grade": "C6"},
                        {"subject": "Biology", "grade": "C6"},
                        {"subject": "Geography", "grade": "C6"}
                    ],
                    "uacePrincipalSubjects": [
                        {"subject": "Mathematics", "grade": "A"},
                        {"subject": "Physics", "grade": "B"}
                    ]
                }
                """.formatted(programmeCode);

        String body = mockMvc.perform(post("/api/v1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(body).path("id").asLong();
        Application saved = applicationRepository.findById(id).orElseThrow();
        saved.setEmailVerified(true);
        return applicationRepository.saveAndFlush(saved);
    }

    @Test
    @DisplayName("Submitting an application writes a decision row that satisfies every constraint")
    void submittingWritesADecisionRow() throws Exception {
        seedProgramme("PERSIST-A");
        Application applicant = createAndVerifyApplicant("PERSIST-A");

        mockMvc.perform(post("/api/v1/applications/" + applicant.getId() + "/submit"))
                .andExpect(status().isOk());

        List<AdmissionDecision> decisions =
                decisionRepository.findByApplicationIdOrderByIdAsc(applicant.getId());

        assertThat(decisions).as("a submitted applicant must produce an auditable decision")
                .hasSize(1);

        AdmissionDecision decision = decisions.get(0);
        assertThat(decision.getTenantId())
                .as("tenant_id is NOT NULL and references tenants(id)")
                .isNotNull();
        assertThat(decision.getOutcome())
                .as("the stored outcome must be the decision that stood")
                .isIn("ADMIT", "REJECT");
        assertThat(decision.getScoringMode())
                .as("the default deployment is LEGACY")
                .isEqualTo("LEGACY");
        assertThat(decision.getSubmittedAt())
                .as("capacity ranking ties break on this, so it cannot be null")
                .isNotNull();
        assertThat(decision.getModelVersion()).isNotBlank();
        assertThat(decision.getCriteriaJson()).isNotBlank();
        assertThat(decision.getGatesJson()).isNotBlank();
    }

    @Test
    @DisplayName("The applicant status is still advanced even though scoring is now in the path")
    void submitStillAdvancesStatus() throws Exception {
        seedProgramme("PERSIST-B");
        Application applicant = createAndVerifyApplicant("PERSIST-B");

        String body = mockMvc.perform(post("/api/v1/applications/" + applicant.getId() + "/submit"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode response = objectMapper.readTree(body);
        assertThat(response.path("status").asText()).isEqualTo("SUBMITTED");
    }

    @Test
    @DisplayName("An applicant with no matching programme choice is scored against nothing, not against everything")
    void unchosenProgrammeProducesNoDecision() throws Exception {
        seedProgramme("PERSIST-C");
        Application applicant = createAndVerifyApplicant("A-PROGRAMME-THAT-DOES-NOT-EXIST");

        mockMvc.perform(post("/api/v1/applications/" + applicant.getId() + "/submit"))
                .andExpect(status().isOk());

        assertThat(decisionRepository.findByApplicationIdOrderByIdAsc(applicant.getId()))
                .as("scoring every programme in the catalogue regardless of the applicant's choices "
                        + "would reject applicants for programmes they never applied to")
                .isEmpty();
    }
}

