package org.nexus.napbackend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record StudentFeeRequest(
        @NotNull @Positive Long studentId,
        @NotNull @Positive Long feeAssignmentId,
        @NotNull @DecimalMin("0.00") BigDecimal amount,
        @NotNull @DecimalMin("0.00") BigDecimal paidAmount,
        LocalDate dueDate,
        String status
) {
}
