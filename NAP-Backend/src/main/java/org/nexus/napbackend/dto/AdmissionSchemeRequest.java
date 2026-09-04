package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdmissionSchemeRequest(
        @NotBlank String schemeName,
        String category,
        String academicYear,
        String intakeMonth,
        String description,
        LocalDateTime appOpenDate,
        LocalDateTime appCloseDate,
        Integer capacity,
        String applicationFees,
        BigDecimal serviceFee,
        String status,
        List<Long> programIds
) {}
