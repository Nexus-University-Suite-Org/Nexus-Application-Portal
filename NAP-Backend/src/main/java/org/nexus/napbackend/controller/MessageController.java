package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.nexus.napbackend.dto.MessageDraftRequest;
import org.nexus.napbackend.dto.MessageDraftResponse;
import org.nexus.napbackend.dto.MessageResponse;
import org.nexus.napbackend.dto.MessageSendRequest;
import org.nexus.napbackend.facade.MessageFacade;
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
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageFacade facade;

    public MessageController(MessageFacade facade) {
        this.facade = facade;
    }

    @PostMapping("/send")
    public ResponseEntity<MessageResponse> send(@Valid @RequestBody MessageSendRequest request,
                                                @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.send(request, userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "inbox") String view) {
        return switch (view) {
            case "sent" -> ResponseEntity.ok(facade.getSent(userId));
            case "starred" -> ResponseEntity.ok(facade.getStarred(userId));
            default -> ResponseEntity.ok(facade.getInbox(userId));
        };
    }

    @GetMapping("/{userId}/{id}")
    public ResponseEntity<MessageResponse> getById(@PathVariable Long userId, @PathVariable Long id) {
        return ResponseEntity.ok(facade.getById(id, userId));
    }

    @PutMapping("/{userId}/{id}/read")
    public ResponseEntity<MessageResponse> markRead(@PathVariable Long userId, @PathVariable Long id) {
        return ResponseEntity.ok(facade.markRead(id, userId));
    }

    @PutMapping("/{userId}/{id}/delete")
    public ResponseEntity<Void> softDelete(@PathVariable Long userId, @PathVariable Long id) {
        facade.softDelete(id, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/{id}/star")
    public ResponseEntity<Void> toggleStar(@PathVariable Long userId, @PathVariable Long id) {
        facade.toggleStar(id, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/{id}/archive")
    public ResponseEntity<Void> toggleArchive(@PathVariable Long userId, @PathVariable Long id) {
        facade.toggleArchive(id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/drafts")
    public ResponseEntity<MessageDraftResponse> saveDraft(@Valid @RequestBody MessageDraftRequest request,
                                                          @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.saveDraft(request, userId));
    }

    @GetMapping("/drafts/{userId}")
    public ResponseEntity<List<MessageDraftResponse>> getDrafts(@PathVariable Long userId) {
        return ResponseEntity.ok(facade.getDrafts(userId));
    }

    @GetMapping("/drafts/{userId}/{id}")
    public ResponseEntity<MessageDraftResponse> getDraftById(@PathVariable Long userId, @PathVariable Long id) {
        return ResponseEntity.ok(facade.getDraftById(id, userId));
    }

    @DeleteMapping("/drafts/{userId}/{id}")
    public ResponseEntity<Void> deleteDraft(@PathVariable Long userId, @PathVariable Long id) {
        facade.deleteDraft(id, userId);
        return ResponseEntity.noContent().build();
    }
}
