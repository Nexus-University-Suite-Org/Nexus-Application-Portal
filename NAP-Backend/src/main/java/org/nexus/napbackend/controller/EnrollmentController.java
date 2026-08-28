package org.nexus.napbackend.controller;

import java.util.List;
import org.nexus.napbackend.dto.EnrollmentCreateRequest;
import org.nexus.napbackend.dto.EnrollmentResponse;
import org.nexus.napbackend.facade.EnrollmentFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentFacade facade;

    public EnrollmentController(EnrollmentFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<EnrollmentResponse>> find(
            @RequestParam(required = false) String studentId) {
        if (studentId != null && !studentId.isBlank()) {
            return ResponseEntity.ok(facade.findByStudentId(studentId));
        }
        return ResponseEntity.ok(List.of());
    }

    @PostMapping
    public ResponseEntity<List<EnrollmentResponse>> create(@RequestBody EnrollmentCreateRequest request) {
        return ResponseEntity.ok(facade.createEnrollments(request));
    }

    @PostMapping("/{id}/update")
    public ResponseEntity<EnrollmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.getOrDefault("status", "pending");
        return ResponseEntity.ok(facade.updateStatus(id, status));
    }
}
