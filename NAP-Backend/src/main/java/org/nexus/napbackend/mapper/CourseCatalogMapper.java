package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.CourseCatalogRequest;
import org.nexus.napbackend.dto.CourseCatalogResponse;
import org.nexus.napbackend.model.CourseCatalog;

public final class CourseCatalogMapper {

    private CourseCatalogMapper() {}

    public static CourseCatalog toEntity(CourseCatalogRequest request) {
        CourseCatalog entity = new CourseCatalog();
        entity.setName(request.name());
        entity.setCode(request.code());
        entity.setCollege(request.college());
        entity.setLevel(request.level());
        entity.setDuration(request.duration());
        entity.setCredits(request.credits());
        entity.setImageUrl(request.imageUrl());
        entity.setPublished(request.published() != null ? request.published() : false);
        return entity;
    }

    public static CourseCatalogResponse toDto(CourseCatalog entity) {
        return new CourseCatalogResponse(
                entity.getId(),
                entity.getName(),
                entity.getCode(),
                entity.getCollege(),
                entity.getLevel(),
                entity.getDuration(),
                entity.getCredits(),
                entity.getImageUrl(),
                entity.getPublished(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static void updateEntity(CourseCatalog entity, CourseCatalogRequest request) {
        entity.setName(request.name());
        entity.setCode(request.code());
        entity.setCollege(request.college());
        entity.setLevel(request.level());
        entity.setDuration(request.duration());
        entity.setCredits(request.credits());
        entity.setImageUrl(request.imageUrl());
        entity.setPublished(request.published() != null ? request.published() : entity.getPublished());
    }
}
