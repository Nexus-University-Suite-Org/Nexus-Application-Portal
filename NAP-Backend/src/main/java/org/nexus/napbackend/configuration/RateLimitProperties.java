package org.nexus.napbackend.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nap.contact.rate-limit")
public record RateLimitProperties(int maxRequests, int windowSeconds) {
}
