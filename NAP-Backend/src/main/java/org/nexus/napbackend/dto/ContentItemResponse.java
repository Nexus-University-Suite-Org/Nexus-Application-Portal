package org.nexus.napbackend.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ContentItemResponse(
        Long id,
        String collection,
        Map<String, Object> fields,
        LocalDateTime createdAt
) {}
