package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record StudentStoryResponse(
        Long id,
        String title,
        String slug,
        String content,
        String studentName,
        String author,
        String program,
        Integer graduationYear,
        String imageUrl,
        Boolean featured,
        LocalDateTime createdAt
) {}
