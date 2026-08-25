package org.nexus.napbackend.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping({"/api/health", "/api/health/", "/api/v1/health"})
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "NAP-Backend");
    }
}
