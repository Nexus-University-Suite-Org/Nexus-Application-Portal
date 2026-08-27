package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.PartnerRequest;
import org.nexus.napbackend.dto.PartnerResponse;
import org.nexus.napbackend.model.Partner;

public final class PartnerMapper {

    private PartnerMapper() {}

    public static Partner toEntity(PartnerRequest request) {
        Partner entity = new Partner();
        entity.setTenantId(request.tenantId());
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setLogoUrl(request.logoUrl());
        entity.setWebsiteUrl(request.websiteUrl());
        return entity;
    }

    public static PartnerResponse toDto(Partner entity) {
        return new PartnerResponse(
                entity.getId(),
                entity.getTenantId(),
                entity.getName(),
                entity.getDescription(),
                entity.getLogoUrl(),
                entity.getWebsiteUrl(),
                entity.getCreatedAt()
        );
    }

    public static void updateEntity(Partner entity, PartnerRequest request) {
        entity.setTenantId(request.tenantId());
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setLogoUrl(request.logoUrl());
        entity.setWebsiteUrl(request.websiteUrl());
    }
}
