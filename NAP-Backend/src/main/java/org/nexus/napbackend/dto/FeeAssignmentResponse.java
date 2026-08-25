package org.nexus.napbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FeeAssignmentResponse(
        Long id,
        String itemName,
        String category,
        String yearLevel,
        String semester,
        String academicYear,
        BigDecimal amount,
        String currency,
        String college,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
