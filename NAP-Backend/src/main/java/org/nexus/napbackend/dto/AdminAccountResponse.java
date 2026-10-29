package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record AdminAccountResponse(
        Long id,
        String email,
        String fullName,
        Long tenantId,
        String role,
        LocalDateTime createdAt
) {
}