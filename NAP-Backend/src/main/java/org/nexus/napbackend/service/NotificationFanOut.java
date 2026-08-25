package org.nexus.napbackend.service;

public interface NotificationFanOut {

    void sendInApp(Long userId, String title, String message);

    void sendEmail(Long userId, String subject, String body);

    void sendPush(Long userId, String title, String body);
}
