package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.nexus.napbackend.dto.ProgramRequest;
import org.nexus.napbackend.dto.ProgramResponse;
import org.nexus.napbackend.facade.ProgramFacade;
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
@RequestMapping("/api/v1/admin/programs")
public class AdminProgramController {

    private final ProgramFacade facade;

    public AdminProgramController(ProgramFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<ProgramResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(facade.search(search));
        }
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(facade.findByStatus(status));
        }
        if (type != null && !type.isEmpty()) {
            return ResponseEntity.ok(facade.findByType(type));
        }
        return ResponseEntity.ok(facade.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProgramResponse> create(
            @Valid @RequestBody ProgramRequest request,
            Principal principal) {
        String email = principal != null ? principal.getName() : "system";
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProgramRequest request,
            Principal principal) {
        String email = principal != null ? principal.getName() : "system";
        return ResponseEntity.ok(facade.update(id, request, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{programId}/categories/{categoryId}")
    public ResponseEntity<Void> assignCategory(
            @PathVariable Long programId,
            @PathVariable Long categoryId) {
        facade.assignCategory(programId, categoryId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{programId}/categories/{categoryId}")
    public ResponseEntity<Void> removeCategory(
            @PathVariable Long programId,
            @PathVariable Long categoryId) {
        facade.removeCategory(programId, categoryId);
        return ResponseEntity.noContent().build();
    }
}
