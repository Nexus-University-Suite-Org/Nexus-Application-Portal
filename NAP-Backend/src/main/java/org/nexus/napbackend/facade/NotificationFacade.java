package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.AnnouncementCreateRequest;
import org.nexus.napbackend.dto.AnnouncementResponse;
import org.nexus.napbackend.dto.NotificationCreateRequest;
import org.nexus.napbackend.dto.NotificationResponse;
import org.nexus.napbackend.mapper.NotificationMapper;
import org.nexus.napbackend.model.Announcement;
import org.nexus.napbackend.model.Notification;
import org.nexus.napbackend.service.NotificationService;
import org.springframework.web.bind.annotation.RequestBody;

@Facade
public class NotificationFacade {

    private final NotificationService service;

    public NotificationFacade(NotificationService service) {
        this.service = service;
    }

    @Transactional
    public NotificationResponse create(NotificationCreateRequest request) {
        Notification entity = NotificationMapper.toEntity(request);
        Notification saved = service.create(entity);
        return NotificationMapper.toDto(saved);
    }

    @Transactional
    public List<NotificationResponse> list(Long userId, Boolean isRead) {
        List<Notification> notifications;
        if (isRead != null) {
            notifications = service.findByUserIdAndRead(userId, isRead);
        } else {
            notifications = service.findByUserId(userId);
        }
        return notifications.stream()
                .map(NotificationMapper::toDto)
                .toList();
    }

    @Transactional
    public NotificationResponse markRead(Long id) {
        Notification notification = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setRead(true);
        Notification updated = service.update(notification);
        return NotificationMapper.toDto(updated);
    }

    @Transactional
    public int markAllRead(Long userId) {
        return service.markAllRead(userId);
    }

    @Transactional
    public void delete(Long id) {
        service.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        service.deleteById(id);
    }

    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementCreateRequest request) {
        Announcement entity = NotificationMapper.toAnnouncementEntity(request);
        Announcement saved = service.createAnnouncement(entity);
        return NotificationMapper.toAnnouncementDto(saved);
    }

    @Transactional
    public List<AnnouncementResponse> listAnnouncements(Long courseId) {
        List<Announcement> announcements;
        if (courseId != null) {
            announcements = service.findAnnouncementsByCourse(courseId);
        } else {
            announcements = service.findAllAnnouncements();
        }
        return announcements.stream()
                .map(NotificationMapper::toAnnouncementDto)
                .toList();
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        service.deleteAnnouncement(id);
    }
}
