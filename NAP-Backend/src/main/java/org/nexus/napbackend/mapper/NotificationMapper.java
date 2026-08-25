package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.AnnouncementCreateRequest;
import org.nexus.napbackend.dto.AnnouncementResponse;
import org.nexus.napbackend.dto.NotificationCreateRequest;
import org.nexus.napbackend.dto.NotificationResponse;
import org.nexus.napbackend.model.Announcement;
import org.nexus.napbackend.model.Notification;

public final class NotificationMapper {

    private NotificationMapper() {
    }

    public static Notification toEntity(NotificationCreateRequest request) {
        Notification entity = new Notification();
        entity.setUserId(request.userId());
        entity.setType(request.type());
        entity.setTitle(request.title());
        entity.setMessage(request.message());
        entity.setRelatedId(request.relatedId());
        entity.setLink(request.link());
        entity.setRead(false);
        return entity;
    }

    public static NotificationResponse toDto(Notification entity) {
        return new NotificationResponse(
                entity.getId(),
                entity.getUserId(),
                entity.getType(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getRelatedId(),
                entity.getLink(),
                entity.getRead(),
                entity.getCreatedAt()
        );
    }

    public static Announcement toAnnouncementEntity(AnnouncementCreateRequest request) {
        Announcement entity = new Announcement();
        entity.setAuthorId(request.authorId());
        entity.setTitle(request.title());
        entity.setBody(request.body());
        entity.setCourseId(request.courseId());
        entity.setIsSystemWide(request.isSystemWide() != null ? request.isSystemWide() : false);
        return entity;
    }

    public static AnnouncementResponse toAnnouncementDto(Announcement entity) {
        return new AnnouncementResponse(
                entity.getId(),
                entity.getAuthorId(),
                entity.getTitle(),
                entity.getBody(),
                entity.getCourseId(),
                entity.getIsSystemWide(),
                entity.getCreatedAt()
        );
    }
}
