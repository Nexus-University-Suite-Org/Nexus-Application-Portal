package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.nexus.napbackend.dto.GalleryItemRequest;
import org.nexus.napbackend.dto.GalleryItemResponse;
import org.nexus.napbackend.facade.GalleryItemFacade;
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
@RequestMapping("/api/v1/admin/gallery")
public class AdminGalleryItemController {

    private final GalleryItemFacade facade;

    public AdminGalleryItemController(GalleryItemFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<GalleryItemResponse>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(facade.search(search));
        }
        return ResponseEntity.ok(facade.findByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GalleryItemResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @PostMapping
    public ResponseEntity<GalleryItemResponse> create(@Valid @RequestBody GalleryItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GalleryItemResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody GalleryItemRequest request) {
        return ResponseEntity.ok(facade.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
