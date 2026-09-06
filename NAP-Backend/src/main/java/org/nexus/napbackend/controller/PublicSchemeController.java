package org.nexus.napbackend.controller;

import java.util.List;
import org.nexus.napbackend.dto.AdmissionSchemeResponse;
import org.nexus.napbackend.facade.AdmissionSchemeFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/schemes")
public class PublicSchemeController {

    private final AdmissionSchemeFacade facade;

    public PublicSchemeController(AdmissionSchemeFacade facade) {
        this.facade = facade;
    }

    @GetMapping("/running")
    public ResponseEntity<List<AdmissionSchemeResponse>> running() {
        return ResponseEntity.ok(facade.findRunning());
    }

    @GetMapping
    public ResponseEntity<List<AdmissionSchemeResponse>> byProgram(
            @RequestParam(required = false) Long programId) {
        if (programId != null) {
            return ResponseEntity.ok(facade.findRunningByProgram(programId));
        }
        return ResponseEntity.ok(facade.findRunning());
    }
}
