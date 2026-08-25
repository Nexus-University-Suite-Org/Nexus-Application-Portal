package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record AnnouncementResponse(
        Long id,
        Long authorId,
        String title,
        String body,
        Long courseId,
        Boolean isSystemWide,
        LocalDateTime createdAt
) {
}
