package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.nexus.napbackend.dto.LegalPageRequest;
import org.nexus.napbackend.dto.LegalPageResponse;
import org.nexus.napbackend.facade.LegalPageFacade;
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
@RequestMapping("/api/v1/admin/legal-pages")
public class AdminLegalPageController {

    private final LegalPageFacade facade;

    public AdminLegalPageController(LegalPageFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<LegalPageResponse>> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(facade.search(search));
        }
        return ResponseEntity.ok(facade.findByType(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LegalPageResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @PostMapping
    public ResponseEntity<LegalPageResponse> create(@Valid @RequestBody LegalPageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LegalPageResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody LegalPageRequest request) {
        return ResponseEntity.ok(facade.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
