package org.nexus.napbackend.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nap.emailjs")
public record EmailJsProperties(
        String baseUrl,
        String serviceId,
        String templateId,
        String publicKey,
        String privateKey
) {
    public boolean configured() {
        return notBlank(serviceId) && notBlank(templateId) && notBlank(publicKey) && notBlank(privateKey);
    }

    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }
}
