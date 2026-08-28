package org.nexus.napbackend.controller;

import java.util.List;
import org.nexus.napbackend.dto.PartnershipDiscussionResponse;
import org.nexus.napbackend.facade.PartnershipDiscussionFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/partnerships")
public class AdminPartnershipController {

    private final PartnershipDiscussionFacade facade;

    public AdminPartnershipController(PartnershipDiscussionFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<PartnershipDiscussionResponse>> list() {
        return ResponseEntity.ok(facade.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartnershipDiscussionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartnershipDiscussionResponse> update(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.getOrDefault("status", "new");
        return ResponseEntity.ok(facade.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
