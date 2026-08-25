package org.nexus.napbackend.service;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import org.nexus.napbackend.configuration.EmailJsProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class EmailJsSender {

    private static final Logger log = LoggerFactory.getLogger(EmailJsSender.class);

    private final EmailJsProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public EmailJsSender(EmailJsProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public boolean send(String name, String email, String subject, String message, String receivedAt) {
        if (!properties.configured()) {
            log.warn("EmailJS is not configured; contact notification skipped");
            return false;
        }
        Map<String, Object> templateParams = new LinkedHashMap<>();
        templateParams.put("name", name);
        templateParams.put("email", email);
        templateParams.put("subject", subject);
        templateParams.put("message", message);
        templateParams.put("time", receivedAt);

        Map<String, Object> body = Map.of(
                "service_id", properties.serviceId(),
                "template_id", properties.templateId(),
                "user_id", properties.publicKey(),
                "accessToken", properties.privateKey(),
                "template_params", templateParams
        );
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(properties.baseUrl()))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();
            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("EmailJS rejected notification: status={} body={}", response.statusCode(), response.body());
                return false;
            }
            return true;
        } catch (JacksonException ex) {
            log.warn("EmailJS payload serialization failed: {}", ex.getMessage());
            return false;
        } catch (Exception ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            log.warn("EmailJS notification failed: {}", ex.getMessage());
            return false;
        }
    }
}
