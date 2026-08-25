package org.nexus.napbackend.dto;

import java.math.BigDecimal;

public record FeeReportResponse(
        String academicYear,
        String college,
        String category,
        String yearLevel,
        String semester,
        String itemName,
        BigDecimal amount,
        String currency,
        long assignedCount,
        BigDecimal totalAssigned,
        BigDecimal totalCollected
) {
}
