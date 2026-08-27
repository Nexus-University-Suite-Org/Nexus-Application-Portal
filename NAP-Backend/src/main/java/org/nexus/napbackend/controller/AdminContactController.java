package org.nexus.napbackend.controller;

import java.util.List;
import org.nexus.napbackend.dto.ContactSubmissionResponse;
import org.nexus.napbackend.facade.ContactSubmissionFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/contacts")
public class AdminContactController {

    private final ContactSubmissionFacade facade;

    public AdminContactController(ContactSubmissionFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<ContactSubmissionResponse>> list(
            @RequestParam(required = false) String status) {
        List<ContactSubmissionResponse> results = facade.findAll();
        if (status != null && !status.isEmpty()) {
            results = results.stream()
                    .filter(r -> status.equalsIgnoreCase(r.status()))
                    .toList();
        }
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactSubmissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ContactSubmissionResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(facade.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
