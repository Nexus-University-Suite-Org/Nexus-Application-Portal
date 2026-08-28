package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.CourseUnitResponse;
import org.nexus.napbackend.model.CourseUnit;

public final class CourseUnitMapper {

    private CourseUnitMapper() {}

    public static CourseUnitResponse toDto(CourseUnit entity) {
        if (entity == null) return null;
        return new CourseUnitResponse(
            entity.getId(),
            entity.getCode(),
            entity.getName(),
            entity.getCredits(),
            entity.getCourse() != null ? entity.getCourse().getId() : null,
            entity.getSemester(),
            entity.getYear()
        );
    }
}
