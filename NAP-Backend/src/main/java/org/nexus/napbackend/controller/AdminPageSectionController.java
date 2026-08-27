package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.nexus.napbackend.dto.PageSectionRequest;
import org.nexus.napbackend.dto.PageSectionResponse;
import org.nexus.napbackend.facade.PageSectionFacade;
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
@RequestMapping("/api/v1/admin/page-sections")
public class AdminPageSectionController {

    private final PageSectionFacade facade;

    public AdminPageSectionController(PageSectionFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<PageSectionResponse>> list(
            @RequestParam(required = false) String pageKey,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(facade.search(search));
        }
        return ResponseEntity.ok(facade.findByPageKey(pageKey));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PageSectionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @PostMapping
    public ResponseEntity<PageSectionResponse> create(@Valid @RequestBody PageSectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PageSectionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody PageSectionRequest request) {
        return ResponseEntity.ok(facade.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
