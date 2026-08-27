package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record CourseCatalogResponse(
        Long id,
        String name,
        String code,
        String college,
        String level,
        String duration,
        Integer credits,
        String imageUrl,
        Boolean published,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
