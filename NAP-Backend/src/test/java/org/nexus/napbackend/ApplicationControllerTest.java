package org.nexus.napbackend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private String createPayload() {
        return """
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john@example.com",
                    "phoneNumber": "+256700000000",
                    "gender": "Male",
                    "nationality": "Ugandan",
                    "district": "Kampala",
                    "programChoice1": "Bachelor of Computer Science",
                    "studyMode": "Full Time",
                    "academicYear": "2024",
                    "semester": "1"
                }
                """;
    }

    @Test
    void createApplicationReturns201WithId() throws Exception {
        mockMvc.perform(post("/api/v1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.emailVerified").value(false));
    }

    @Test
    void createApplicationWithMissingFieldsReturns400() throws Exception {
        mockMvc.perform(post("/api/v1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitApplicationFailsWhenEmailNotVerified() throws Exception {
        String created = mockMvc.perform(post("/api/v1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(post("/api/v1/applications/" + id + "/submit"))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void getApplicationById() throws Exception {
        String created = mockMvc.perform(post("/api/v1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(get("/api/v1/applications/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.prn").isNotEmpty());
    }

    @Test
    void listApplicationsByStatus() throws Exception {
        mockMvc.perform(post("/api/v1/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createPayload()));

        mockMvc.perform(get("/api/v1/applications?status=DRAFT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void reviewApplicationSetsReviewStatus() throws Exception {
        String created = mockMvc.perform(post("/api/v1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(put("/api/v1/applications/" + id + "/review?status=admitted&notes=Good grades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewStatus").value("admitted"))
                .andExpect(jsonPath("$.status").value("ADMITTED"));
    }

    @Test
    void deleteApplicationReturns204() throws Exception {
        String created = mockMvc.perform(post("/api/v1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(delete("/api/v1/applications/" + id))
                .andExpect(status().isNoContent());
    }
}
