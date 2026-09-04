package org.nexus.napbackend.service;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.nexus.napbackend.model.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class NotificationBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(NotificationBroadcaster.class);

    private final Map<String, SseEmitter> clients = new ConcurrentHashMap<>();

    public String connect(SseEmitter emitter) {
        String id = UUID.randomUUID().toString();
        clients.put(id, emitter);
        log.info("SSE client connected: {} (total: {})", id, clients.size());

        emitter.onCompletion(() -> {
            clients.remove(id);
            log.info("SSE client disconnected: {} (total: {})", id, clients.size());
        });
        emitter.onTimeout(() -> {
            clients.remove(id);
            log.info("SSE client timed out: {} (total: {})", id, clients.size());
        });
        emitter.onError(e -> {
            clients.remove(id);
            log.warn("SSE client error: {} - {}", id, e.getMessage());
        });

        return id;
    }

    public void broadcast(Notification notification) {
        if (clients.isEmpty()) {
            return;
        }

        Map<String, Object> payload = Map.of(
                "id", notification.getId(),
                "userId", notification.getUserId(),
                "type", notification.getType(),
                "title", notification.getTitle(),
                "message", notification.getMessage(),
                "relatedId", notification.getRelatedId() != null ? notification.getRelatedId() : 0L,
                "link", notification.getLink() != null ? notification.getLink() : "",
                "read", notification.getRead(),
                "createdAt", notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : ""
        );

        clients.forEach((clientId, emitter) -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(payload));
            } catch (IOException e) {
                clients.remove(clientId);
                log.warn("Failed to send SSE to client {}: {}", clientId, e.getMessage());
            }
        });

        log.info("Broadcast notification '{}' to {} client(s)", notification.getTitle(), clients.size());
    }

    public int getConnectedClients() {
        return clients.size();
    }
}
