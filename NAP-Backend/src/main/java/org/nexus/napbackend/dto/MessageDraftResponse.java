package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record MessageDraftResponse(
        Long id,
        Long userId,
        Long toUserId,
        String subject,
        String body,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
