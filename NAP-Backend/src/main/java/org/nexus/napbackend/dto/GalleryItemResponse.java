package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record GalleryItemResponse(
        Long id,
        String src,
        String alt,
        String caption,
        String category,
        Integer span,
        LocalDateTime createdAt
) {}
