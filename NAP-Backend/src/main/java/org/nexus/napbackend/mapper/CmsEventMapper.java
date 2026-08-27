package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.CmsEventRequest;
import org.nexus.napbackend.dto.CmsEventResponse;
import org.nexus.napbackend.model.CmsEvent;

public final class CmsEventMapper {

    private CmsEventMapper() {}

    public static CmsEvent toEntity(CmsEventRequest request) {
        CmsEvent entity = new CmsEvent();
        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setEventDate(request.eventDate());
        entity.setImageUrl(request.imageUrl());
        entity.setPublished(request.published() != null ? request.published() : false);
        return entity;
    }

    public static CmsEventResponse toDto(CmsEvent entity) {
        return new CmsEventResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getEventDate(),
                entity.getImageUrl(),
                entity.getPublished(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static void updateEntity(CmsEvent entity, CmsEventRequest request) {
        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setEventDate(request.eventDate());
        entity.setImageUrl(request.imageUrl());
        entity.setPublished(request.published() != null ? request.published() : entity.getPublished());
    }
}
