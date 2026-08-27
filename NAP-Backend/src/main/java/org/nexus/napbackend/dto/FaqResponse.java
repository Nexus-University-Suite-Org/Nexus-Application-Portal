package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record FaqResponse(
        Long id,
        String category,
        String question,
        String answer,
        Integer displayOrder,
        LocalDateTime createdAt
) {}
