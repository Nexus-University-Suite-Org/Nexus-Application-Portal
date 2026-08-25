package org.nexus.napbackend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "nap.contact.rate-limit.max-requests=2",
        "nap.contact.rate-limit.window-seconds=3600"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ContactRateLimitTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void floodBeyondLimitIsRejected() throws Exception {
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/v1/contact")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(contact(i)))
                    .andExpect(status().isCreated());
        }
        mockMvc.perform(post("/api/v1/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(contact(99)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.detail").isNotEmpty());
    }

    private String contact(int suffix) {
        return """
                {"name":"Flooder %d","email":"flood%d@example.com","subject":"Spam","message":"Message %d"}
                """.formatted(suffix, suffix, suffix);
    }
}
