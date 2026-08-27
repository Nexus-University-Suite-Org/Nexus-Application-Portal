package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.GalleryItemRequest;
import org.nexus.napbackend.dto.GalleryItemResponse;
import org.nexus.napbackend.model.GalleryItem;

public final class GalleryItemMapper {

    private GalleryItemMapper() {}

    public static GalleryItem toEntity(GalleryItemRequest request) {
        GalleryItem entity = new GalleryItem();
        entity.setSrc(request.src());
        entity.setAlt(request.alt());
        entity.setCaption(request.caption());
        entity.setCategory(request.category());
        entity.setSpan(request.span() != null ? request.span() : 1);
        return entity;
    }

    public static GalleryItemResponse toDto(GalleryItem entity) {
        return new GalleryItemResponse(
                entity.getId(),
                entity.getSrc(),
                entity.getAlt(),
                entity.getCaption(),
                entity.getCategory(),
                entity.getSpan(),
                entity.getCreatedAt()
        );
    }

    public static void updateEntity(GalleryItem entity, GalleryItemRequest request) {
        entity.setSrc(request.src());
        entity.setAlt(request.alt());
        entity.setCaption(request.caption());
        entity.setCategory(request.category());
        entity.setSpan(request.span() != null ? request.span() : entity.getSpan());
    }
}
