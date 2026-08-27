package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record CmsEventResponse(
        Long id,
        String title,
        String description,
        LocalDateTime eventDate,
        String imageUrl,
        Boolean published,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
