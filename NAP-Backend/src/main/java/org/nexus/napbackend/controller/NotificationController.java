package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.nexus.napbackend.dto.AnnouncementCreateRequest;
import org.nexus.napbackend.dto.AnnouncementResponse;
import org.nexus.napbackend.dto.NotificationCreateRequest;
import org.nexus.napbackend.dto.NotificationResponse;
import org.nexus.napbackend.facade.NotificationFacade;
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
@RequestMapping("/api/v1")
public class NotificationController {

    private final NotificationFacade facade;

    public NotificationController(NotificationFacade facade) {
        this.facade = facade;
    }

    @PostMapping("/notifications")
    public ResponseEntity<NotificationResponse> create(@Valid @RequestBody NotificationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> list(
            @RequestParam Long userId,
            @RequestParam(required = false) Boolean isRead) {
        return ResponseEntity.ok(facade.list(userId, isRead));
    }

    @PutMapping("/notifications/{id}")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable Long id,
                                                          @RequestBody(required = false) Map<String, Boolean> body) {
        return ResponseEntity.ok(facade.markRead(id));
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<Map<String, Object>> markReadPost(@PathVariable Long id) {
        facade.markRead(id);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/notifications/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllRead(@RequestBody Map<String, Long> body) {
        Long userId = body.get("user_id");
        if (userId == null) {
            userId = body.get("recipientId");
        }
        int updated = facade.markAllRead(userId);
        return ResponseEntity.ok(Map.of("status", "ok", "updated", updated));
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facade.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/announcements")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @Valid @RequestBody AnnouncementCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.createAnnouncement(request));
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<AnnouncementResponse>> listAnnouncements(
            @RequestParam(required = false) Long courseId) {
        return ResponseEntity.ok(facade.listAnnouncements(courseId));
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        facade.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }
}
