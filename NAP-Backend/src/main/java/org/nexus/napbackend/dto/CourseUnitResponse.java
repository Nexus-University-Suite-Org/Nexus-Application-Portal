package org.nexus.napbackend.dto;

public record CourseUnitResponse(
    Long id,
    String code,
    String name,
    Integer credits,
    Long course,
    Integer semester,
    Integer year
) {}
