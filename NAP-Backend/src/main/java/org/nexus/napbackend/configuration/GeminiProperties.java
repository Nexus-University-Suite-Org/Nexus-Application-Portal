package org.nexus.napbackend.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nap.gemini")
public record GeminiProperties(
        String apiKey,
        String model
) {
    public boolean configured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String resolvedModel() {
        return (model != null && !model.isBlank()) ? model : "gemini-3.6-flash";
    }
}
