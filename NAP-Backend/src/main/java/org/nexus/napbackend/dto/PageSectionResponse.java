package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record PageSectionResponse(
        Long id,
        Long tenantId,
        String pageKey,
        String sectionKey,
        String title,
        String subtitle,
        String body,
        String imageUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
