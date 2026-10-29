package org.nexus.napbackend.configuration;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Connection details for Nexus Identity, the university-wide SSO provider.
 *
 * <p>{@code issuer} is the value that must appear verbatim in the {@code iss}
 * claim. {@code baseUrl} exists separately because a container may reach the
 * identity service over a private hostname while browsers use the public one;
 * when it is omitted it falls back to the issuer.
 */
@ConfigurationProperties(prefix = "nexus.identity")
public record IdentityProperties(
        String issuer,
        String baseUrl,
        String jwkSetUri,
        String bootstrapSecret,
        List<String> audiences,
        Duration connectTimeout,
        Duration readTimeout
) {

    /** The OAuth clients that legitimately call this API. */
    private static final List<String> DEFAULT_AUDIENCES = List.of(
            "nexus-application-portal",
            "nexus-admissions-dashboard",
            "nexus-student-portal",
            "nexus-registrar",
            "nexus-lecturer",
            "nexus-admissions-service");

    private static final String LOCAL_ISSUER = "http://localhost:9000";

    public IdentityProperties {
        issuer = stripTrailingSlash(isBlank(issuer) ? LOCAL_ISSUER : issuer);
        baseUrl = stripTrailingSlash(isBlank(baseUrl) ? issuer : baseUrl);
        jwkSetUri = stripTrailingSlash(isBlank(jwkSetUri) ? issuer + "/oauth2/jwks" : jwkSetUri);
        bootstrapSecret = bootstrapSecret == null ? "" : bootstrapSecret;
        audiences = audiences == null || audiences.isEmpty()
                ? DEFAULT_AUDIENCES
                : audiences.stream().map(String::trim).filter(value -> !value.isEmpty()).toList();
        connectTimeout = connectTimeout == null ? Duration.ofSeconds(2) : connectTimeout;
        readTimeout = readTimeout == null ? Duration.ofSeconds(5) : readTimeout;
    }

    /** Only the transitional login endpoints need the bootstrap secret. */
    public boolean hasBootstrapSecret() {
        return !bootstrapSecret.isBlank();
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String stripTrailingSlash(String value) {
        String result = value.trim();
        while (result.endsWith("/")) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }
}
