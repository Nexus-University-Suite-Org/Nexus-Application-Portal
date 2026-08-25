package org.nexus.napbackend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
@TestPropertySource(properties = "nap.contact.rate-limit.max-requests=1000")
class ContactFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void validSubmissionIsAcceptedWithQueuedFalse() throws Exception {
        mockMvc.perform(post("/api/v1/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Jane Doe","email":"jane@example.com","subject":"Hello","message":"I need information."}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.queued").value(false));
    }

    @Test
    void invalidPayloadReturnsProblemDetail() throws Exception {
        mockMvc.perform(post("/api/v1/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"","email":"not-an-email","message":""}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").isNotEmpty())
                .andExpect(jsonPath("$.errors.name").isNotEmpty());
    }

    @Test
    void legacyAliasRouteAcceptsSubmissions() throws Exception {
        mockMvc.perform(post("/api/contact/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Legacy Caller","email":"legacy@example.com","subject":"","message":"Via old route."}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    void healthEndpointReportsServiceName() throws Exception {
        String body = mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertThat(body).contains("NAP-Backend");
    }
}
