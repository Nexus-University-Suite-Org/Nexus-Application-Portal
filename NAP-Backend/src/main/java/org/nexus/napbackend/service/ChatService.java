package org.nexus.napbackend.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.nexus.napbackend.configuration.GeminiProperties;
import org.nexus.napbackend.dto.ChatRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final GeminiProperties geminiProperties;
    private final GeminiKnowledgeBase knowledgeBase;

    public ChatService(GeminiProperties geminiProperties, GeminiKnowledgeBase knowledgeBase) {
        this.geminiProperties = geminiProperties;
        this.knowledgeBase = knowledgeBase;
    }

    public StreamingResponseBody streamChat(ChatRequest request) {
        return outputStream -> {
            try {
                callGeminiStream(request.messages(), outputStream);
            } catch (Exception e) {
                log.error("Chat streaming error", e);
                writeSseError(outputStream, "Service temporarily unavailable. Please try again.");
            }
        };
    }

    private void callGeminiStream(List<ChatRequest.ChatMessage> messages, OutputStream outputStream) throws IOException {
        String apiUrl = buildApiUrl();
        String requestBody = buildGeminiRequest(messages);

        HttpURLConnection conn = (HttpURLConnection) URI.create(apiUrl).toURL().openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(10_000);
        conn.setReadTimeout(60_000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes(StandardCharsets.UTF_8));
        }

        int status = conn.getResponseCode();
        if (status != 200) {
            String errorBody = readErrorStream(conn);
            log.error("Gemini API returned status {}: {}", status, errorBody);
            writeSseError(outputStream, "AI service error. Please try again.");
            return;
        }

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            transformGeminiSseToOpenAi(reader, outputStream);
        } finally {
            conn.disconnect();
        }
    }

    private void transformGeminiSseToOpenAi(BufferedReader reader, OutputStream outputStream) throws IOException {
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.isBlank() || line.startsWith(":")) {
                continue;
            }

            if (line.startsWith("data: ")) {
                String json = line.substring(6).trim();
                if (json.isEmpty()) continue;

                String text = extractTextFromGemini(json);
                if (text != null && !text.isEmpty()) {
                    String openAiChunk = "{\"choices\":[{\"delta\":{\"content\":\""
                            + escapeJson(text) + "\"}}]}";
                    writeSseLine(outputStream, openAiChunk);
                }
            }
        }

        writeSseLine(outputStream, "[DONE]");
        outputStream.flush();
    }

    private String extractTextFromGemini(String json) {
        // Simple extraction: find "text":"..." pattern in Gemini response
        // Gemini SSE format: {"candidates":[{"content":{"parts":[{"text":"..."}],"role":"model"}}]}
        int textIdx = json.indexOf("\"text\":");
        if (textIdx == -1) return null;

        int startQuote = json.indexOf('"', textIdx + 7);
        if (startQuote == -1) return null;

        // Find the closing quote, handling escaped quotes
        StringBuilder sb = new StringBuilder();
        int i = startQuote + 1;
        while (i < json.length()) {
            char c = json.charAt(i);
            if (c == '\\' && i + 1 < json.length()) {
                char next = json.charAt(i + 1);
                if (next == '"') {
                    sb.append('"');
                    i += 2;
                } else if (next == '\\') {
                    sb.append('\\');
                    i += 2;
                } else if (next == 'n') {
                    sb.append('\n');
                    i += 2;
                } else {
                    sb.append(c);
                    i++;
                }
            } else if (c == '"') {
                break;
            } else {
                sb.append(c);
                i++;
            }
        }
        return sb.toString();
    }

    private String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private void writeSseLine(OutputStream outputStream, String data) throws IOException {
        outputStream.write(("data: " + data + "\n\n").getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
    }

    private void writeSseError(OutputStream outputStream, String message) throws IOException {
        String errorChunk = "{\"choices\":[{\"delta\":{\"content\":\"" + escapeJson(message) + "\"}}]}";
        writeSseLine(outputStream, errorChunk);
        writeSseLine(outputStream, "[DONE]");
        outputStream.flush();
    }

    private String buildApiUrl() {
        return "https://generativelanguage.googleapis.com/v1beta/models/"
                + geminiProperties.resolvedModel()
                + ":streamGenerateContent?alt=sse&key=" + geminiProperties.apiKey();
    }

    private String buildGeminiRequest(List<ChatRequest.ChatMessage> messages) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"contents\":[");

        // Build conversation history for Gemini
        // Gemini uses "user" and "model" roles (not "assistant")
        boolean first = true;
        for (ChatRequest.ChatMessage msg : messages) {
            if (!first) sb.append(",");
            first = false;

            String geminiRole = "assistant".equals(msg.role()) ? "model" : msg.role();
            sb.append("{\"role\":\"").append(geminiRole).append("\",\"parts\":[{\"text\":\"")
                    .append(escapeJson(msg.content())).append("\"}]}");
        }

        sb.append("],\"systemInstruction\":{\"parts\":[{\"text\":\"")
                .append(escapeJson(knowledgeBase.getSystemPrompt()))
                .append("\"}]}}");

        return sb.toString();
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
