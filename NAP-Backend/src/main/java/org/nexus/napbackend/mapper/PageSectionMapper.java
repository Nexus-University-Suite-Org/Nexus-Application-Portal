package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.PageSectionRequest;
import org.nexus.napbackend.dto.PageSectionResponse;
import org.nexus.napbackend.model.PageSection;

public final class PageSectionMapper {

    private PageSectionMapper() {}

    public static PageSection toEntity(PageSectionRequest request) {
        PageSection entity = new PageSection();
        entity.setPageKey(request.pageKey());
        entity.setSectionKey(request.sectionKey());
        entity.setTitle(request.title());
        entity.setSubtitle(request.subtitle());
        entity.setBody(request.body());
        entity.setImageUrl(request.imageUrl());
        return entity;
    }

    public static PageSectionResponse toDto(PageSection entity) {
        return new PageSectionResponse(
                entity.getId(),
                entity.getTenantId(),
                entity.getPageKey(),
                entity.getSectionKey(),
                entity.getTitle(),
                entity.getSubtitle(),
                entity.getBody(),
                entity.getImageUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static void updateEntity(PageSection entity, PageSectionRequest request) {
        entity.setPageKey(request.pageKey());
        entity.setSectionKey(request.sectionKey());
        entity.setTitle(request.title());
        entity.setSubtitle(request.subtitle());
        entity.setBody(request.body());
        entity.setImageUrl(request.imageUrl());
    }
}
