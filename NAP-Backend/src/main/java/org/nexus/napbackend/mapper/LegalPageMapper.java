package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.LegalPageRequest;
import org.nexus.napbackend.dto.LegalPageResponse;
import org.nexus.napbackend.model.LegalPage;

public final class LegalPageMapper {

    private LegalPageMapper() {}

    public static LegalPage toEntity(LegalPageRequest request) {
        LegalPage entity = new LegalPage();
        entity.setTitle(request.title());
        entity.setSlug(request.slug());
        entity.setType(request.type());
        entity.setVersion(request.version());
        entity.setUpdatedDate(request.updatedDate());
        entity.setContent(request.content());
        return entity;
    }

    public static LegalPageResponse toDto(LegalPage entity) {
        return new LegalPageResponse(
                entity.getId(),
                entity.getTenantId(),
                entity.getTitle(),
                entity.getSlug(),
                entity.getType(),
                entity.getVersion(),
                entity.getUpdatedDate(),
                entity.getContent(),
                entity.getCreatedAt()
        );
    }

    public static void updateEntity(LegalPage entity, LegalPageRequest request) {
        entity.setTitle(request.title());
        entity.setSlug(request.slug());
        entity.setType(request.type());
        entity.setVersion(request.version());
        entity.setUpdatedDate(request.updatedDate());
        entity.setContent(request.content());
    }
}
