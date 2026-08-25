package org.nexus.napbackend;

import static org.assertj.core.api.Assertions.assertThat;
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
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "spring.flyway.enabled=false")
class FeeAssignmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private String createPayload() {
        return """
                {
                    "itemName": "Tuition Fee",
                    "category": "Academic",
                    "yearLevel": "Year 1",
                    "semester": "Semester 1",
                    "academicYear": "2024",
                    "amount": 500000.00,
                    "currency": "UGX",
                    "college": "Computing",
                    "notes": "Main tuition"
                }
                """;
    }

    @Test
    void createFeeAssignmentReturns201WithId() throws Exception {
        mockMvc.perform(post("/api/v1/fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.itemName").value("Tuition Fee"))
                .andExpect(jsonPath("$.amount").value(500000.00))
                .andExpect(jsonPath("$.currency").value("UGX"));
    }

    @Test
    void createFeeAssignmentWithMissingFieldsReturns400() throws Exception {
        mockMvc.perform(post("/api/v1/fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getFeeAssignmentByIdReturnsCorrectRecord() throws Exception {
        String created = mockMvc.perform(post("/api/v1/fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(get("/api/v1/fees/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemName").value("Tuition Fee"))
                .andExpect(jsonPath("$.college").value("Computing"));
    }

    @Test
    void getFeeAssignmentByNonExistentIdReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/fees/99999"))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void listFeeAssignmentsReturnsArray() throws Exception {
        mockMvc.perform(post("/api/v1/fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()));

        mockMvc.perform(get("/api/v1/fees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void updateFeeAssignmentModifiesRecord() throws Exception {
        String created = mockMvc.perform(post("/api/v1/fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        String updatedPayload = """
                {
                    "itemName": "Updated Tuition Fee",
                    "category": "Academic",
                    "yearLevel": "Year 1",
                    "semester": "Semester 1",
                    "academicYear": "2024",
                    "amount": 600000.00,
                    "currency": "UGX",
                    "college": "Computing"
                }
                """;

        mockMvc.perform(put("/api/v1/fees/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemName").value("Updated Tuition Fee"))
                .andExpect(jsonPath("$.amount").value(600000.00));
    }

    @Test
    void deleteFeeAssignmentReturns204() throws Exception {
        String created = mockMvc.perform(post("/api/v1/fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(delete("/api/v1/fees/" + id))
                .andExpect(status().isNoContent());
    }

    @Test
    void reportEndpointReturnsArray() throws Exception {
        mockMvc.perform(post("/api/v1/fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()));

        mockMvc.perform(get("/api/v1/fees/report"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void reportEndpointFiltersByAcademicYear() throws Exception {
        mockMvc.perform(post("/api/v1/fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()));

        mockMvc.perform(get("/api/v1/fees/report?academicYear=2024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
