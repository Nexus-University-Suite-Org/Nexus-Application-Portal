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
        String preferredStartDate,
        BigDecimal serviceFee,
        String status,
        Double oLevelWeight,
        Double aLevelWeight,
        Integer bestOfOLevel,
        String passGradeThreshold,
        List<Long> programIds
) {}
