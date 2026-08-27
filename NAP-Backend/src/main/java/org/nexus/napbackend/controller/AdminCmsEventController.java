package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.nexus.napbackend.dto.CmsEventRequest;
import org.nexus.napbackend.dto.CmsEventResponse;
import org.nexus.napbackend.facade.CmsEventFacade;
import org.springframework.format.annotation.DateTimeFormat;
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
@RequestMapping("/api/v1/admin/events")
public class AdminCmsEventController {

    private final CmsEventFacade facade;

    public AdminCmsEventController(CmsEventFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<CmsEventResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(facade.search(search));
        }
        if (startDate != null || endDate != null) {
            return ResponseEntity.ok(facade.findByDateRange(startDate, endDate));
        }
        return ResponseEntity.ok(facade.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CmsEventResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }

    @PostMapping
    public ResponseEntity<CmsEventResponse> create(@Valid @RequestBody CmsEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CmsEventResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CmsEventRequest request) {
        return ResponseEntity.ok(facade.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
