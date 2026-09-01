package org.nexus.napbackend.mapper;

import java.util.List;
import org.nexus.napbackend.dto.ProgramCategoryRequest;
import org.nexus.napbackend.dto.ProgramCategoryResponse;
import org.nexus.napbackend.model.ProgramCategory;

public final class ProgramCategoryMapper {

    private ProgramCategoryMapper() {}

    public static ProgramCategory toEntity(ProgramCategoryRequest request) {
        ProgramCategory entity = new ProgramCategory();
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
        return entity;
    }

    public static ProgramCategoryResponse toDto(ProgramCategory entity, List<ProgramCategoryResponse.ProgramSummary> programs) {
        return new ProgramCategoryResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getDisplayOrder(),
                entity.getCreatedAt(),
                programs
        );
    }

    public static void updateEntity(ProgramCategory entity, ProgramCategoryRequest request) {
        entity.setName(request.name());
        if (request.description() != null) entity.setDescription(request.description());
        if (request.displayOrder() != null) entity.setDisplayOrder(request.displayOrder());
    }
}
