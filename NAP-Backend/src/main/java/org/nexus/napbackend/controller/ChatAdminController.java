package org.nexus.napbackend.controller;

import java.io.IOException;
import org.nexus.napbackend.service.NapMlClient;
import org.nexus.napbackend.tenancy.TenantContext;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatAdminController {

    private final NapMlClient mlClient;

    public ChatAdminController(NapMlClient mlClient) {
        this.mlClient = mlClient;
    }

    @GetMapping(value = "/api/v1/chat/status", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> status() {
        try {
            return ResponseEntity.ok(mlClient.call("GET", "/api/status", true, TenantContext.currentRef()));
        } catch (IOException e) {
            return ResponseEntity.ok(
                    "{\"trained\":false,\"backend\":\"nap-ml-service\",\"error\":\"ML service unreachable\"}");
        }
    }

    @GetMapping(value = "/api/v1/chat/sources", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> sources() {
        try {
            return ResponseEntity.ok(mlClient.call("GET", "/api/sources", true, TenantContext.currentRef()));
        } catch (IOException e) {
            return ResponseEntity.ok("{\"available\":{},\"indexed\":{}}");
        }
    }

    @PostMapping(value = "/api/v1/chat/train", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> train() {
        try {
            return ResponseEntity.ok(mlClient.call("POST", "/api/train", true, TenantContext.currentRef()));
        } catch (IOException e) {
            return ResponseEntity.status(502).body("{\"error\":\"ML service unreachable\"}");
        }
    }
}