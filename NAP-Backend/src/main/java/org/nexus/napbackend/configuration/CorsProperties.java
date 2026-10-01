package org.nexus.napbackend.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nap.cors")
public record CorsProperties(String allowedOrigins) {

    public String allowedOrigins() {
        return allowedOrigins == null || allowedOrigins.isBlank()
                ? "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5177,http://localhost:5178,"
                        + "http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5177,http://127.0.0.1:5178"
                : allowedOrigins;
    }
}
