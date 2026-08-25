package org.nexus.napbackend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record FeeAssignmentRequest(
        @NotBlank @Size(max = 200) String itemName,
        @NotBlank @Size(max = 100) String category,
        @NotBlank @Size(max = 50) String yearLevel,
        @NotBlank @Size(max = 50) String semester,
        @NotBlank @Size(max = 20) String academicYear,
        @NotNull @DecimalMin("0.00") BigDecimal amount,
        @Size(max = 3) String currency,
        @NotBlank @Size(max = 200) String college,
        @Size(max = 1000) String notes
) {
}
