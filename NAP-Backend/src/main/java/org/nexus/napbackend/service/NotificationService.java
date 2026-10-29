package org.nexus.napbackend.service;

import org.nexus.napbackend.tenancy.TenantContext;

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

    private final NotificationRepository notificationRepository;
    private final AnnouncementRepository announcementRepository;
    private final NotificationBroadcaster broadcaster;

    public NotificationService(NotificationRepository notificationRepository,
                               AnnouncementRepository announcementRepository,
                               NotificationBroadcaster broadcaster) {
        this.notificationRepository = notificationRepository;
        this.announcementRepository = announcementRepository;
        this.broadcaster = broadcaster;
    }

    public Notification create(Notification entity) {
        entity.setTenantId(TenantContext.getCurrentTenantId());
        entity.setCreatedAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(entity);
        broadcaster.broadcast(saved);
        return saved;
    }

    public Optional<Notification> findById(Long id) {
        return notificationRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenantId());
    }

    public List<Notification> findByUserId(Long userId) {
        return notificationRepository.findByTenantIdAndUserIdOrderByCreatedAtDesc(
                TenantContext.getCurrentTenantId(), userId);
    }

    public List<Notification> findByUserIdAndRead(Long userId, Boolean read) {
        return notificationRepository.findByTenantIdAndUserIdAndReadOrderByCreatedAtDesc(
                TenantContext.getCurrentTenantId(), userId, read);
    }

    public List<Notification> findAll() {
        return notificationRepository.findAllByTenantIdOrderByCreatedAtDesc(
                TenantContext.getCurrentTenantId());
    }

    public Notification update(Notification entity) {
        return notificationRepository.save(entity);
    }

    public int markAllRead(Long userId) {
        return notificationRepository.markAllForTenant(
                TenantContext.getCurrentTenantId(), userId, true, false);
    }

    public void deleteById(Long id) {
        notificationRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenantId())
                .ifPresent(notificationRepository::delete);
    }

    public Announcement createAnnouncement(Announcement entity) {
        entity.setTenantId(TenantContext.getCurrentTenantId());
        entity.setCreatedAt(LocalDateTime.now());
        return announcementRepository.save(entity);
    }

    public List<Announcement> findAllAnnouncements() {
        return announcementRepository.findAllByTenantIdOrderByCreatedAtDesc(
                TenantContext.getCurrentTenantId());
    }

    public List<Announcement> findAnnouncementsByCourse(Long courseId) {
        return announcementRepository.findByTenantIdAndCourseIdOrderByCreatedAtDesc(
                TenantContext.getCurrentTenantId(), courseId);
    }

    public List<Announcement> findSystemWideAnnouncements() {
        return announcementRepository.findByTenantIdAndIsSystemWideTrueOrderByCreatedAtDesc(
                TenantContext.getCurrentTenantId());
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenantId())
                .ifPresent(announcementRepository::delete);
    }

    public Optional<Announcement> findAnnouncementById(Long id) {
        return announcementRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenantId());
    }

    public Announcement updateAnnouncement(Announcement entity) {
        return announcementRepository.save(entity);
    }
}
