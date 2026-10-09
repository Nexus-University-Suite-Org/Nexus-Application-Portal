package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record TenantResponse(
        Long id,
        String code,
        String name,
        String domain,
        boolean active,
        LocalDateTime createdAt,
        long adminCount
) {
}