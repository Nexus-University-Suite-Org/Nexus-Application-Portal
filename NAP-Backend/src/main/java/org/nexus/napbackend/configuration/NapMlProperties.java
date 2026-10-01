package org.nexus.napbackend.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nap.ml-service")
public record NapMlProperties(
        String baseUrl,
        Integer connectTimeoutMs,
        Integer readTimeoutMs
) {
    public String resolvedBaseUrl() {
        return (baseUrl != null && !baseUrl.isBlank()) ? baseUrl : "http://127.0.0.1:8000";
    }
}