package org.nexus.napbackend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class StudentFeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private Long createFeeAssignment() throws Exception {
        String result = mockMvc.perform(post("/api/v1/fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "itemName": "Tuition Fee",
                                    "category": "Academic",
                                    "yearLevel": "Year 1",
                                    "semester": "Semester 1",
                                    "academicYear": "2024",
                                    "amount": 500000.00,
                                    "currency": "UGX",
                                    "college": "Computing"
                                }
                                """))
                .andReturn().getResponse().getContentAsString();
        return ((Number) com.jayway.jsonpath.JsonPath.read(result, "$.id")).longValue();
    }

    private String createPayload(Long feeAssignmentId) {
        return """
                {
                    "studentId": 101,
                    "feeAssignmentId": %d,
                    "amount": 500000.00,
                    "paidAmount": 100000.00,
                    "dueDate": "2024-12-31",
                    "status": "PARTIAL"
                }
                """.formatted(feeAssignmentId);
    }

    @Test
    void createStudentFeeReturns201WithComputedBalance() throws Exception {
        Long feeAssignmentId = createFeeAssignment();

        mockMvc.perform(post("/api/v1/student-fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload(feeAssignmentId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.studentId").value(101))
                .andExpect(jsonPath("$.amount").value(500000.00))
                .andExpect(jsonPath("$.paidAmount").value(100000.00))
                .andExpect(jsonPath("$.balance").value(400000.00))
                .andExpect(jsonPath("$.status").value("PARTIAL"));
    }

    @Test
    void recordPaymentUpdatesBalanceAndStatus() throws Exception {
        Long feeAssignmentId = createFeeAssignment();
        String created = mockMvc.perform(post("/api/v1/student-fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload(feeAssignmentId)))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(post("/api/v1/student-fees/" + id + "/payments?amount=400000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paidAmount").value(500000.00))
                .andExpect(jsonPath("$.balance").value(0.00))
                .andExpect(jsonPath("$.status").value("PAID"));
    }

    @Test
    void listStudentFeesByStudentIdReturnsArray() throws Exception {
        Long feeAssignmentId = createFeeAssignment();
        mockMvc.perform(post("/api/v1/student-fees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createPayload(feeAssignmentId)));

        mockMvc.perform(get("/api/v1/student-fees?studentId=101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void deleteStudentFeeReturns204() throws Exception {
        Long feeAssignmentId = createFeeAssignment();
        String created = mockMvc.perform(post("/api/v1/student-fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload(feeAssignmentId)))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(delete("/api/v1/student-fees/" + id))
                .andExpect(status().isNoContent());
    }

    @Test
    void createStudentFeeWithMissingFieldsReturns400() throws Exception {
        mockMvc.perform(post("/api/v1/student-fees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
