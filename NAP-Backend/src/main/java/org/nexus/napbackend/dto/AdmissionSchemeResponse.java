package org.nexus.napbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdmissionSchemeResponse(
        Long id,
        String schemeName,
        String category,
        String academicYear,
        String intakeMonth,
        String description,
        LocalDateTime appOpenDate,
        LocalDateTime appCloseDate,
        Integer capacity,
        String applicationFees,
        String preferredStartDate,
        BigDecimal serviceFee,
        String status,
        Long daysLeft,
        Integer programCount,
        List<ProgramSummary> programs,
        String createdBy,
        LocalDateTime createdAt,
        String updatedBy,
        LocalDateTime updatedAt
) {

    public record ProgramSummary(Long id, String programName, String programCode, String programType) {}
}
