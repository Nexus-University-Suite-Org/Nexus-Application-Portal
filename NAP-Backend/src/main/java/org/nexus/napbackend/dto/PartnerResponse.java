package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record PartnerResponse(
        Long id,
        Long tenantId,
        String name,
        String description,
        String logoUrl,
        String websiteUrl,
        LocalDateTime createdAt
) {}
