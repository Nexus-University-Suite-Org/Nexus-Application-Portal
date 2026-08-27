package org.nexus.napbackend.dto;

public record ProgrammeResponse(
        Long id,
        String code,
        String name,
        String faculty,
        int minimumUcePasses,
        double cutoffScore,
        String essentialSubjects,
        String relevantSubjects,
        String desirableSubjects,
        String entryRequirements,
        boolean isActive,
        int capacity
) {}
