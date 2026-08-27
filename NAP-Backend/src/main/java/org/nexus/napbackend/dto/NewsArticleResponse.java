package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record NewsArticleResponse(
        Long id,
        String title,
        String slug,
        String excerpt,
        String content,
        String category,
        String imageUrl,
        Boolean featured,
        Boolean published,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
