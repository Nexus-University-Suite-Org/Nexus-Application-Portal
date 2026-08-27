package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record QuickLinkResponse(
        Long id,
        String title,
        String url,
        String icon,
        Integer displayOrder,
        LocalDateTime createdAt
) {}
