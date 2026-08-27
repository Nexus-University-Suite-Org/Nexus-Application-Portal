package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.ScholarshipRequest;
import org.nexus.napbackend.dto.ScholarshipResponse;
import org.nexus.napbackend.model.Scholarship;

public final class ScholarshipMapper {

    private ScholarshipMapper() {}

    public static Scholarship toEntity(ScholarshipRequest request) {
        Scholarship entity = new Scholarship();
        entity.setTenantId(request.tenantId());
        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setEligibility(request.eligibility());
        entity.setDeadline(request.deadline());
        return entity;
    }

    public static ScholarshipResponse toDto(Scholarship entity) {
        return new ScholarshipResponse(
                entity.getId(),
                entity.getTenantId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getEligibility(),
                entity.getDeadline(),
                entity.getCreatedAt()
        );
    }

    public static void updateEntity(Scholarship entity, ScholarshipRequest request) {
        entity.setTenantId(request.tenantId());
        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setEligibility(request.eligibility());
        entity.setDeadline(request.deadline());
    }
}
