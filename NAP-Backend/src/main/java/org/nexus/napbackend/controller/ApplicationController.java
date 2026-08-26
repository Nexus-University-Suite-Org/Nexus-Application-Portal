package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.nexus.napbackend.dto.ApplicationCreateRequest;
import org.nexus.napbackend.dto.ApplicationResponse;
import org.nexus.napbackend.facade.ApplicationFacade;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/applications")
public class ApplicationController {

    private final ApplicationFacade facade;

    public ApplicationController(ApplicationFacade facade) {
        this.facade = facade;
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> create(@RequestBody ApplicationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApplicationResponse> submit(@PathVariable Long id) {
        return ResponseEntity.ok(facade.submit(id));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ApplicationResponse> review(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(facade.review(id, status, notes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> find(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String reviewStatus) {
        if (email != null) {
            return ResponseEntity.ok(facade.findByEmail(email));
        }
        if (status != null) {
            return ResponseEntity.ok(facade.findByStatus(status));
        }
        if (reviewStatus != null) {
            return ResponseEntity.ok(facade.findByReviewStatus(reviewStatus));
        }
        return ResponseEntity.ok(facade.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
