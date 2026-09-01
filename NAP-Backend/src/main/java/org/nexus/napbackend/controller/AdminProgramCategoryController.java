package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.nexus.napbackend.dto.ProgramCategoryRequest;
import org.nexus.napbackend.dto.ProgramCategoryResponse;
import org.nexus.napbackend.facade.ProgramCategoryFacade;
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
@RequestMapping("/api/v1/admin/program-categories")
public class AdminProgramCategoryController {

    private final ProgramCategoryFacade facade;

    public AdminProgramCategoryController(ProgramCategoryFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<ProgramCategoryResponse>> list() {
        return ResponseEntity.ok(facade.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramCategoryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProgramCategoryResponse> create(@Valid @RequestBody ProgramCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramCategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProgramCategoryRequest request) {
        return ResponseEntity.ok(facade.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
