package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record ScholarshipResponse(
        Long id,
        Long tenantId,
        String title,
        String description,
        String eligibility,
        LocalDateTime deadline,
        LocalDateTime createdAt
) {}
