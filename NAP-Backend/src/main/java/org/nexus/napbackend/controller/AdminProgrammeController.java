package org.nexus.napbackend.controller;

import java.util.Map;
import org.nexus.napbackend.dto.ProgrammeResponse;
import org.nexus.napbackend.service.ProgrammeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/programmes")
public class AdminProgrammeController {

    private final ProgrammeService programmeService;

    public AdminProgrammeController(ProgrammeService programmeService) {
        this.programmeService = programmeService;
    }

    @PutMapping("/cutoff")
    public ResponseEntity<ProgrammeResponse> updateCutoff(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        double cutoffScore = ((Number) body.get("cutoffScore")).doubleValue();
        return programmeService.updateCutoffByCode(code, cutoffScore)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
