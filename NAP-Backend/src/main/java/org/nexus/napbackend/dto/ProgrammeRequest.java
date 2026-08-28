package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;

public record ProgrammeRequest(
        @NotBlank String code,
        @NotBlank String name,
        String faculty,
        int minimumUcePasses,
        double cutoffScore,
        String essentialSubjects,
        String relevantSubjects,
        String desirableSubjects,
        String entryRequirements,
        boolean isActive,
        int capacity,
        String intakeYear
) {}
