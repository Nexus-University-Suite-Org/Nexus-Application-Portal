package org.nexus.napbackend.controller;

import java.time.LocalDateTime;
import java.util.List;
import org.nexus.napbackend.dto.AuditLogResponse;
import org.nexus.napbackend.facade.AuditLogFacade;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/activities")
public class AuditLogController {

    private final AuditLogFacade facade;

    public AuditLogController(AuditLogFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> list(
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(required = false) String entity,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(facade.list(limit, entity, userId, startDate, endDate));
    }
}
