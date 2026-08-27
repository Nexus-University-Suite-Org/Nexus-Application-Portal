package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record ContactSubmissionResponse(
        Long id,
        Long tenantId,
        String name,
        String email,
        String subject,
        String message,
        String source,
        String status,
        String ipAddress,
        LocalDateTime emailedAt,
        LocalDateTime createdAt
) {}
