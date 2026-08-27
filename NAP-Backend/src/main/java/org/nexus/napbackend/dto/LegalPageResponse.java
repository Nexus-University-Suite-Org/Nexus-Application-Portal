package org.nexus.napbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record LegalPageResponse(
        Long id,
        Long tenantId,
        String title,
        String slug,
        String type,
        String version,
        LocalDate updatedDate,
        String content,
        LocalDateTime createdAt
) {}
