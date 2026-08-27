package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.PartnershipDiscussionResponse;
import org.nexus.napbackend.model.PartnershipDiscussion;

public final class PartnershipDiscussionMapper {

    private PartnershipDiscussionMapper() {}

    public static PartnershipDiscussionResponse toDto(PartnershipDiscussion entity) {
        return new PartnershipDiscussionResponse(
                entity.getId(),
                entity.getTenantId(),
                entity.getOrganizationName(),
                entity.getContact_email(),
                entity.getContactPhone(),
                entity.getContactPerson(),
                entity.getMessage(),
                entity.getStatus(),
                entity.getIpAddress(),
                entity.getCreatedAt()
        );
    }
}
