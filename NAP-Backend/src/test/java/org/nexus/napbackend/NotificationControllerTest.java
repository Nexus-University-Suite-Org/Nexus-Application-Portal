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
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private String createPayload() {
        return """
                {
                    "userId": 1,
                    "type": "FEE_ASSIGNED",
                    "title": "New Fee",
                    "message": "A fee has been assigned"
                }
                """;
    }

    @Test
    void createNotificationReturns201() throws Exception {
        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.type").value("FEE_ASSIGNED"))
                .andExpect(jsonPath("$.read").value(false));
    }

    @Test
    void listNotificationsByUserId() throws Exception {
        mockMvc.perform(post("/api/v1/notifications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createPayload()));

        mockMvc.perform(get("/api/v1/notifications?userId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void markNotificationReadReturnsOk() throws Exception {
        String created = mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(put("/api/v1/notifications/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true));
    }

    @Test
    void markAllReadReturnsUpdatedCount() throws Exception {
        mockMvc.perform(post("/api/v1/notifications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createPayload()));
        mockMvc.perform(post("/api/v1/notifications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createPayload()));

        mockMvc.perform(post("/api/v1/notifications/mark-all-read")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"user_id\": 1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.updated").isNumber());
    }

    @Test
    void deleteNotificationReturns204() throws Exception {
        String created = mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload()))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(delete("/api/v1/notifications/" + id))
                .andExpect(status().isNoContent());
    }

    @Test
    void createAnnouncementReturns201() throws Exception {
        mockMvc.perform(post("/api/v1/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "authorId": 1,
                                    "title": "System Maintenance",
                                    "body": "System will be down for maintenance",
                                    "isSystemWide": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("System Maintenance"));
    }

    @Test
    void listAnnouncementsReturnsArray() throws Exception {
        mockMvc.perform(post("/api/v1/announcements")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"authorId": 1, "title": "Test", "body": "Content"}
                        """));

        mockMvc.perform(get("/api/v1/announcements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
