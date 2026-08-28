package org.nexus.napbackend.controller;

import java.util.List;
import java.util.Map;
import org.nexus.napbackend.dto.ProgrammeRequest;
import org.nexus.napbackend.dto.ProgrammeResponse;
import org.nexus.napbackend.dto.QualificationResult;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Programme;
import org.nexus.napbackend.service.ApplicationService;
import org.nexus.napbackend.service.ProgrammeService;
import org.nexus.napbackend.service.WeightingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/programmes")
public class ProgrammeController {

    private final ProgrammeService programmeService;
    private final ApplicationService applicationService;
    private final WeightingService weightingService;

    public ProgrammeController(ProgrammeService programmeService,
                               ApplicationService applicationService,
                               WeightingService weightingService) {
        this.programmeService = programmeService;
        this.applicationService = applicationService;
        this.weightingService = weightingService;
    }

    @GetMapping
    public ResponseEntity<List<ProgrammeResponse>> listAll() {
        return ResponseEntity.ok(programmeService.findAllActive());
    }

    @PostMapping
    public ResponseEntity<ProgrammeResponse> create(@RequestBody ProgrammeRequest request) {
        ProgrammeResponse created = programmeService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{code}")
    public ResponseEntity<ProgrammeResponse> getByCode(@PathVariable String code) {
        return programmeService.findByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgrammeResponse> update(@PathVariable Long id, @RequestBody ProgrammeRequest request) {
        return programmeService.update(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        programmeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/application/{applicationId}/qualifications")
    public ResponseEntity<Map<String, Object>> getQualifications(@PathVariable Long applicationId) {
        Application app = applicationService.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));
        List<Programme> programmes = programmeService.findActiveEntities();
        String qualificationResultsJson = weightingService.evaluateAllChoices(app, programmes);
        String assignedProgramme = weightingService.findAssignedProgramme(app, programmes);
        double totalWeightScore = 0;
        try {
            List<QualificationResult> results = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(qualificationResultsJson, new com.fasterxml.jackson.core.type.TypeReference<>() {});
            totalWeightScore = results.stream().mapToDouble(QualificationResult::totalScore).max().orElse(0);
        } catch (Exception ignored) {}
        return ResponseEntity.ok(Map.of(
                "qualificationResults", qualificationResultsJson,
                "assignedProgramme", assignedProgramme != null ? assignedProgramme : "",
                "totalWeightScore", totalWeightScore
        ));
    }

    @PutMapping("/application/{applicationId}/assign/{programmeCode}")
    public ResponseEntity<Map<String, String>> overrideProgramme(
            @PathVariable Long applicationId,
            @PathVariable String programmeCode) {
        Application app = applicationService.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));
        Programme programme = programmeService.findEntityByCode(programmeCode)
                .orElseThrow(() -> new RuntimeException("Programme not found with code: " + programmeCode));
        app.setAssignedProgramme(programme.getCode());
        applicationService.update(app);
        return ResponseEntity.ok(Map.of(
                "assignedProgramme", programme.getCode(),
                "programmeName", programme.getName()
        ));
    }
}
