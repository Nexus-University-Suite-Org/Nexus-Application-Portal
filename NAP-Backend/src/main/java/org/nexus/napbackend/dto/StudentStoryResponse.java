package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record StudentStoryResponse(
        Long id,
        String title,
        String slug,
        String content,
        String author,
        Boolean featured,
        LocalDateTime createdAt
) {}
