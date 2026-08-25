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
class MessageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private String sendPayload() {
        return """
                {
                    "toUserId": 2,
                    "subject": "Hello",
                    "body": "Test message body"
                }
                """;
    }

    @Test
    void sendMessageReturns201() throws Exception {
        mockMvc.perform(post("/api/v1/messages/send?userId=1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sendPayload()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.fromUserId").value(1))
                .andExpect(jsonPath("$.toUserId").value(2))
                .andExpect(jsonPath("$.subject").value("Hello"));
    }

    @Test
    void getInboxReturnsArray() throws Exception {
        mockMvc.perform(post("/api/v1/messages/send?userId=1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sendPayload()));

        mockMvc.perform(get("/api/v1/messages/2?view=inbox"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getSentReturnsArray() throws Exception {
        mockMvc.perform(post("/api/v1/messages/send?userId=1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sendPayload()));

        mockMvc.perform(get("/api/v1/messages/1?view=sent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void softDeleteMessageDoesNotAppearInInbox() throws Exception {
        String created = mockMvc.perform(post("/api/v1/messages/send?userId=1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sendPayload()))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(put("/api/v1/messages/2/" + id + "/delete"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/messages/2?view=inbox"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + id + ")]").isEmpty());
    }

    @Test
    void toggleStarSetsStarredFlag() throws Exception {
        String created = mockMvc.perform(post("/api/v1/messages/send?userId=1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sendPayload()))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(put("/api/v1/messages/2/" + id + "/star"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/messages/2?view=starred"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + id + ")]").isNotEmpty());
    }

    @Test
    void saveDraftAndListDrafts() throws Exception {
        String draftPayload = """
                {
                    "toUserId": 2,
                    "subject": "Draft Subject",
                    "body": "Draft body content"
                }
                """;

        mockMvc.perform(post("/api/v1/messages/drafts?userId=1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(draftPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.subject").value("Draft Subject"));

        mockMvc.perform(get("/api/v1/messages/drafts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void deleteDraftReturns204() throws Exception {
        String created = mockMvc.perform(post("/api/v1/messages/drafts?userId=1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"subject": "To Delete", "body": "content"}
                                """))
                .andReturn().getResponse().getContentAsString();
        Long id = ((Number) com.jayway.jsonpath.JsonPath.read(created, "$.id")).longValue();

        mockMvc.perform(delete("/api/v1/messages/drafts/1/" + id))
                .andExpect(status().isNoContent());
    }
}
