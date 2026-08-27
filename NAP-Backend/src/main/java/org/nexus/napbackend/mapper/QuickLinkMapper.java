package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.QuickLinkRequest;
import org.nexus.napbackend.dto.QuickLinkResponse;
import org.nexus.napbackend.model.QuickLink;

public final class QuickLinkMapper {

    private QuickLinkMapper() {}

    public static QuickLink toEntity(QuickLinkRequest request) {
        QuickLink entity = new QuickLink();
        entity.setTitle(request.title());
        entity.setUrl(request.url());
        entity.setIcon(request.icon());
        entity.setDisplayOrder(request.displayOrder());
        return entity;
    }

    public static QuickLinkResponse toDto(QuickLink entity) {
        return new QuickLinkResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getUrl(),
                entity.getIcon(),
                entity.getDisplayOrder(),
                entity.getCreatedAt()
        );
    }

    public static void updateEntity(QuickLink entity, QuickLinkRequest request) {
        entity.setTitle(request.title());
        entity.setUrl(request.url());
        entity.setIcon(request.icon());
        entity.setDisplayOrder(request.displayOrder());
    }
}
