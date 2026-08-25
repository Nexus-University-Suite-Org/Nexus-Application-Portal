package org.nexus.napbackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * No-op implementation of NotificationFanOut.
 * In-app notifications are handled directly by NotificationService.
 * Email digest and push notifications will be implemented in a future phase.
 */
@Component
public class NoOpNotificationFanOut implements NotificationFanOut {

    private static final Logger log = LoggerFactory.getLogger(NoOpNotificationFanOut.class);

    @Override
    public void sendInApp(Long userId, String title, String message) {
        log.debug("In-app notification sent to user {}: {}", userId, title);
    }

    @Override
    public void sendEmail(Long userId, String subject, String body) {
        log.debug("Email notification (stub) for user {}: {}", userId, subject);
    }

    @Override
    public void sendPush(Long userId, String title, String body) {
        log.debug("Push notification (stub) for user {}: {}", userId, title);
    }
}
