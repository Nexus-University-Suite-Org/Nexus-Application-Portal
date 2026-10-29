package org.nexus.napbackend.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nap.ml-service")
public record NapMlProperties(
        String baseUrl,
        Integer connectTimeoutMs,
        Integer readTimeoutMs,
        String adminToken
) {
    public String resolvedBaseUrl() {
        return (baseUrl != null && !baseUrl.isBlank()) ? baseUrl : "http://127.0.0.1:8000";
    }

    /**
     * Shared secret used to call the ML service's admin endpoints. Returned
     * without surrounding whitespace so a stray newline in the Railway variable
     * does not turn every admin call into a 403.
     */
    public String resolvedAdminToken() {
        return adminToken == null ? "" : adminToken.trim();
    }
}