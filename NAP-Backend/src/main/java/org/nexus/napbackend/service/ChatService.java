package org.nexus.napbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import org.nexus.napbackend.configuration.NapMlProperties;
import org.nexus.napbackend.dto.ChatRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final NapMlProperties mlProperties;
    private final ObjectMapper objectMapper;

    public ChatService(NapMlProperties mlProperties, ObjectMapper objectMapper) {
        this.mlProperties = mlProperties;
        this.objectMapper = objectMapper;
    }

    public StreamingResponseBody streamChat(ChatRequest request) {
        return outputStream -> {
            try {
                proxyToMlService(request, outputStream);
            } catch (Exception e) {
                log.error("Chat streaming error", e);
                writeSseError(outputStream, "Service temporarily unavailable. Please try again.");
            }
        };
    }

    private void proxyToMlService(ChatRequest request, OutputStream outputStream) throws IOException {
        String baseUrl = mlProperties.resolvedBaseUrl();
        HttpURLConnection conn = (HttpURLConnection) URI.create(baseUrl + "/api/chat").toURL().openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Accept", "text/event-stream");
        conn.setDoOutput(true);
        conn.setConnectTimeout(mlProperties.connectTimeoutMs() != null ? mlProperties.connectTimeoutMs() : 5_000);
        conn.setReadTimeout(mlProperties.readTimeoutMs() != null ? mlProperties.readTimeoutMs() : 120_000);

        String requestBody = objectMapper.writeValueAsString(request);
        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes(StandardCharsets.UTF_8));
        }

        int status = conn.getResponseCode();
        if (status != 200) {
            String errorBody = readErrorStream(conn);
            log.error("ML service returned status {}: {}", status, errorBody);
            writeSseError(outputStream, "AI service error. Please try again.");
            return;
        }

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                outputStream.write((line + "\n").getBytes(StandardCharsets.UTF_8));
                outputStream.flush();
            }
        } finally {
            conn.disconnect();
        }
    }

    private void writeSseError(OutputStream outputStream, String message) throws IOException {
        String escaped = message.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n");
        outputStream.write(("data: {\"choices\":[{\"delta\":{\"content\":\"" + escaped + "\"}}]}\n\n").getBytes(StandardCharsets.UTF_8));
        outputStream.write("data: [DONE]\n\n".getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
    }

    private String readErrorStream(HttpURLConnection conn) {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        } catch (Exception e) {
            return "Unable to read error response";
        }
    }
}