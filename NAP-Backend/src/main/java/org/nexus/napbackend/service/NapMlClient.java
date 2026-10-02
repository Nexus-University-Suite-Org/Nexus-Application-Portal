package org.nexus.napbackend.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import org.nexus.napbackend.configuration.NapMlProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NapMlClient {

    private static final Logger log = LoggerFactory.getLogger(NapMlClient.class);

    private final NapMlProperties mlProperties;

    public NapMlClient(NapMlProperties mlProperties) {
        this.mlProperties = mlProperties;
    }

    public String call(String method, String path) throws IOException {
        return call(method, path, false);
    }

    /**
     * Calls the ML service. Admin paths ({@code /api/train}, {@code /api/sources})
     * are guarded by a shared token because they trigger a full index rebuild;
     * without forwarding it the ML service answers 401/403.
     */
    public String call(String method, String path, boolean admin) throws IOException {
        String baseUrl = mlProperties.resolvedBaseUrl();
        HttpURLConnection conn = (HttpURLConnection) URI.create(baseUrl + path).toURL().openConnection();
        conn.setRequestMethod(method);
        conn.setConnectTimeout(5_000);
        conn.setReadTimeout(60_000);

        if (admin) {
            String token = mlProperties.resolvedAdminToken();
            if (token.isEmpty()) {
                throw new IOException(
                        "ML admin token is not configured (ML_SERVICE_ADMIN_TOKEN)");
            }
            conn.setRequestProperty("Authorization", "Bearer " + token);
        }

        if ("POST".equalsIgnoreCase(method)) {
            conn.setDoOutput(true);
            try (OutputStream os = conn.getOutputStream()) {
                os.flush();
            }
        }

        int status = conn.getResponseCode();
        InputStream stream = (status >= 200 && status < 300)
                ? conn.getInputStream()
                : conn.getErrorStream();
        String body = readBody(stream);
        conn.disconnect();

        if (status >= 400) {
            log.error("ML service {} {} returned {}: {}", method, path, status, body);
            throw new IOException("ML service returned status " + status);
        }
        return body;
    }

    public boolean reachable() {
        try {
            call("GET", "/api/health");
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String readBody(InputStream stream) throws IOException {
        if (stream == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }
}