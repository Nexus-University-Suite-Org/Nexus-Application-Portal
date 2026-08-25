package org.nexus.napbackend.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nap.cors")
public record CorsProperties(String allowedOrigins) {

    public String allowedOrigins() {
        return allowedOrigins == null || allowedOrigins.isBlank()
                ? "http://localhost:5174,http://127.0.0.1:5174"
                : allowedOrigins;
    }
}
