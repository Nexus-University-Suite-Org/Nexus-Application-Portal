package org.nexus.napbackend;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Guards the admin authorization boundary.
 *
 * <p>Regression context: {@code /api/v1/admin/programs/**}, {@code /api/v1/admin/schemes/**} and
 * {@code /api/v1/admin/program-categories/**} were each declared {@code permitAll()} ahead of the
 * catch-all {@code /api/v1/admin/** hasRole("ADMIN")} rule. Spring Security evaluates
 * {@code requestMatchers} in declaration order and honours the first match, so those three
 * prefixes were fully reachable without a token — including the admission-selection ranking added
 * with the scoring work.
 *
 * <p>Since the move to Nexus Identity there is no local token minter to call. The tests inject a
 * pre-authenticated {@code JwtAuthenticationToken} instead, which is exactly the state the
 * resource-server filter produces after a token validates. Token validation itself is covered by
 * the identity server's smoke test and by {@code NexusAccessTokenValidator}.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AdminSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("programme thresholds cannot be rewritten without an admin token")
    void programmeWriteRequiresAdmin() throws Exception {
        mockMvc.perform(put("/api/v1/admin/programs/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"programName\":\"Hijacked\",\"cutoffIndex\":1.0}"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("admission selection rankings cannot be read without an admin token")
    void programmeSelectionRequiresAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/programs/1/selection"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("scheme weighting overrides cannot be read without an admin token")
    void schemeReadRequiresAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/schemes/1"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("programme categories cannot be read without an admin token")
    void programCategoryReadRequiresAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/program-categories/1"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("programme-category assignment cannot be changed without an admin token")
    void programCategoryAssignmentRequiresAdmin() throws Exception {
        mockMvc.perform(post("/api/v1/admin/programs/1/categories/1"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("an authenticated non-admin is still rejected on admin routes")
    void nonAdminRoleIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/admin/programs/1/selection")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_STUDENT"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("an applicant token is also rejected on admin routes")
    void applicantRoleIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/stats")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_APPLICANT"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("admin login is not blocked by the authorization layer")
    void adminLoginIsNotForbidden() throws Exception {
        mockMvc.perform(post("/api/v1/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(result -> assertNotEquals(
                        HttpStatus.FORBIDDEN.value(),
                        result.getResponse().getStatus(),
                        "admin login must stay reachable without a bearer token"));
    }

    @Test
    @DisplayName("student identity profile requires a student access token")
    void studentSsoProfileRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/auth/student/me"))
                        .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("student identity profile requires a verified email")
    void studentSsoProfileRequiresVerifiedEmail() throws Exception {
        mockMvc.perform(get("/api/v1/auth/student/me")
                                .with(jwt()
                                        .jwt(token -> token
                                                .claim("email", "student@example.edu")
                                                .claim("email_verified", false)
                                                .claim("aud", List.of("nexus-student-portal")))
                                        .authorities(new SimpleGrantedAuthority("ROLE_STUDENT"))))
                        .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("public programme browsing stays public")
    void publicProgrammeBrowsingStaysPublic() throws Exception {
        mockMvc.perform(get("/api/v1/programs"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("applicant endpoints stay public")
    void applicantEndpointsStayPublic() throws Exception {
        mockMvc.perform(get("/api/v1/applications"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("an admissions officer token is admitted to admin routes")
    void adminRoleIsAdmitted() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/stats")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMISSIONS_OFFICER"))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("an admissions officer token is admitted to the selection ranking")
    void adminRoleSeesSelection() throws Exception {
        mockMvc.perform(get("/api/v1/admin/programs/1/selection")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMISSIONS_OFFICER"))))
                .andExpect(result -> assertNotEquals(
                        HttpStatus.FORBIDDEN.value(),
                        result.getResponse().getStatus(),
                        "an admin token must be able to reach the selection endpoint"));
    }
}
