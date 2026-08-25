package org.nexus.napbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record StudentFeeResponse(
        Long id,
        Long studentId,
        Long feeAssignmentId,
        BigDecimal amount,
        BigDecimal paidAmount,
        BigDecimal balance,
        LocalDate dueDate,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
