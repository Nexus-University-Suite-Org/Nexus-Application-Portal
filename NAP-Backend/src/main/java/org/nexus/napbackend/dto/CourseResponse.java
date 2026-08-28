package org.nexus.napbackend.dto;

public record CourseResponse(
    Long id,
    String code,
    String name,
    String college,
    String department,
    Integer durationYears
) {}
