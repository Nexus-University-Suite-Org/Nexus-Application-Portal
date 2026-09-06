package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.nexus.napbackend.dto.AdmissionSchemeRequest;
import org.nexus.napbackend.dto.AdmissionSchemeResponse;
import org.nexus.napbackend.facade.AdmissionSchemeFacade;
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
@RequestMapping("/api/v1/admin/schemes")
public class AdminSchemeController {

    private final AdmissionSchemeFacade facade;

    public AdminSchemeController(AdmissionSchemeFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<AdmissionSchemeResponse>> list() {
        return ResponseEntity.ok(facade.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdmissionSchemeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @PostMapping
    public ResponseEntity<AdmissionSchemeResponse> create(
            @Valid @RequestBody AdmissionSchemeRequest request,
            Principal principal) {
        String email = principal != null ? principal.getName() : "system";
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdmissionSchemeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AdmissionSchemeRequest request,
            Principal principal) {
        String email = principal != null ? principal.getName() : "system";
        return ResponseEntity.ok(facade.update(id, request, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
