package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.nexus.napbackend.dto.FaqRequest;
import org.nexus.napbackend.dto.FaqResponse;
import org.nexus.napbackend.facade.FaqFacade;
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
@RequestMapping("/api/v1/admin/faqs")
public class AdminFaqController {

    private final FaqFacade facade;

    public AdminFaqController(FaqFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<FaqResponse>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(facade.search(search));
        }
        return ResponseEntity.ok(facade.findByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FaqResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @PostMapping
    public ResponseEntity<FaqResponse> create(@Valid @RequestBody FaqRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FaqResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody FaqRequest request) {
        return ResponseEntity.ok(facade.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
