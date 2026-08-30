package org.nexus.napbackend.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nap.cors")
public record CorsProperties(String allowedOrigins) {

    public String allowedOrigins() {
        return allowedOrigins == null || allowedOrigins.isBlank()
                ? "http://localhost:5174,http://localhost:5178,http://127.0.0.1:5174,http://127.0.0.1:5178"
                : allowedOrigins;
    }
}
