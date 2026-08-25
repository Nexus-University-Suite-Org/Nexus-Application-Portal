package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import org.nexus.napbackend.dto.ChatRequest;
import org.nexus.napbackend.service.ChatService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping(value = {"/api/v1/chat", "/api/v1/chat/"}, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<StreamingResponseBody> chat(@Valid @RequestBody ChatRequest request) {
        StreamingResponseBody stream = chatService.streamChat(request);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(stream);
    }

    @PostMapping(value = {"/api/chat", "/api/chat/"}, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<StreamingResponseBody> chatLegacy(@Valid @RequestBody ChatRequest request) {
        StreamingResponseBody stream = chatService.streamChat(request);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(stream);
    }
}
