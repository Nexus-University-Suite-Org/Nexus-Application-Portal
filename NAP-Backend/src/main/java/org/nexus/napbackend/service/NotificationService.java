package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Announcement;
import org.nexus.napbackend.model.Notification;
import org.nexus.napbackend.repository.AnnouncementRepository;
import org.nexus.napbackend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Long DEMO_TENANT_ID = 1L;

    private final NotificationRepository notificationRepository;
    private final AnnouncementRepository announcementRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               AnnouncementRepository announcementRepository) {
        this.notificationRepository = notificationRepository;
        this.announcementRepository = announcementRepository;
    }

    public Notification create(Notification entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(entity);
    }

    public Optional<Notification> findById(Long id) {
        return notificationRepository.findById(id);
    }

    public List<Notification> findByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> findByUserIdAndRead(Long userId, Boolean read) {
        return notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, read);
    }

    public List<Notification> findAll() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public Notification update(Notification entity) {
        return notificationRepository.save(entity);
    }

    public int markAllRead(Long userId) {
        return notificationRepository.markAll(userId, true, false);
    }

    public void deleteById(Long id) {
        notificationRepository.deleteById(id);
    }

    public Announcement createAnnouncement(Announcement entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        return announcementRepository.save(entity);
    }

    public List<Announcement> findAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Announcement> findAnnouncementsByCourse(Long courseId) {
        return announcementRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
    }

    public List<Announcement> findSystemWideAnnouncements() {
        return announcementRepository.findByIsSystemWideTrueOrderByCreatedAtDesc();
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }

    public Optional<Announcement> findAnnouncementById(Long id) {
        return announcementRepository.findById(id);
    }

    public Announcement updateAnnouncement(Announcement entity) {
        return announcementRepository.save(entity);
    }
}
