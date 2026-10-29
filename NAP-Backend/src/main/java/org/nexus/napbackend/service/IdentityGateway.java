package org.nexus.napbackend.service;

import java.util.List;
import java.util.Map;
import org.nexus.napbackend.configuration.IdentityProperties;
import org.nexus.napbackend.exception.IdentityUnavailableException;
import org.nexus.napbackend.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

/**
 * The only place NAP talks to Nexus Identity.
 *
 * <p>The transitional admin/student login endpoints still live here for the
 * portals that have not moved to the redirect flow yet. Rather than keeping a
 * second copy of every password hash and a second token format, they delegate to
 * the identity service and hand back the token it minted. Once every frontend
 * uses the SDK these methods — and the endpoints that call them — can be
 * deleted without touching the rest of the application.
 */
@Service
public class IdentityGateway {

    private static final Logger log = LoggerFactory.getLogger(IdentityGateway.class);

    /** Client whose role bundle decides what an admissions user may do here. */
    public static final String APPLICATION_PORTAL_CLIENT = "nexus-application-portal";

    /** Client whose role bundle covers applicants and students. */
    public static final String STUDENT_PORTAL_CLIENT = "nexus-student-portal";

    private final IdentityProperties properties;
    private final RestClient restClient;

    public IdentityGateway(IdentityProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory(properties))
                .build();
    }

    /**
     * Mirrors the identity server's {@code /api/v1/internal/authenticate}
     * response. {@code token} is a short-lived RS256 access token; the refresh
     * token is returned too so a portal that still stores tokens can keep a
     * session alive while it migrates.
     */
    public record IdentitySession(
            String sub,
            String email,
            String name,
            List<String> roles,
            String token,
            String refreshToken,
            long expiresIn
    ) {
    }

    /**
     * Verifies credentials against the identity service.
     *
     * @throws UnauthorizedException        when the credentials are wrong or the
     *                                      account may not use this client
     * @throws IdentityUnavailableException when the identity service is down or
     *                                      the bootstrap secret is not configured
     */
    public IdentitySession authenticate(String email, String password, String clientId) {
        if (!properties.hasBootstrapSecret()) {
            throw new IdentityUnavailableException(
                    "IDENTITY_BOOTSTRAP_SECRET is not set, so the legacy login endpoints are disabled.");
        }

        try {
            IdentitySession session = restClient.post()
                    .uri("/api/v1/internal/authenticate")
                    .header("X-Bootstrap-Secret", properties.bootstrapSecret())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "email", email == null ? "" : email,
                            "password", password == null ? "" : password,
                            "clientId", clientId))
                    .retrieve()
                    .body(IdentitySession.class);

            if (session == null || session.token() == null || session.token().isBlank()) {
                throw new IdentityUnavailableException("Nexus Identity returned an empty session.");
            }
            return session;
        } catch (RestClientResponseException e) {
            int status = e.getStatusCode().value();
            if (status == 400 || status == 401) {
                throw new UnauthorizedException("Invalid email or password");
            }
            if (status == 403) {
                throw new UnauthorizedException("This account is not entitled to use this portal.");
            }
            log.error("Nexus Identity rejected a login with status {}", status);
            throw new IdentityUnavailableException("Nexus Identity returned " + status, e);
        } catch (RestClientException e) {
            log.error("Could not reach Nexus Identity at {}", properties.baseUrl(), e);
            throw new IdentityUnavailableException("Could not reach Nexus Identity.", e);
        }
    }

    /**
     * Asks the identity service to send a reset link.
     *
     * <p>Deliberately silent: the endpoint it calls answers identically whether
     * or not the address exists, and so does this method. A caller must never be
     * able to use it to discover which emails have accounts.
     */
    public void requestPasswordReset(String email) {
        try {
            restClient.post()
                    .uri("/api/v1/password/forgot")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("email", email == null ? "" : email))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.warn("Could not forward a password reset request to Nexus Identity: {}", e.getMessage());
        }
    }

    private static SimpleClientHttpRequestFactory requestFactory(IdentityProperties properties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) properties.connectTimeout().toMillis());
        factory.setReadTimeout((int) properties.readTimeout().toMillis());
        return factory;
    }
}
