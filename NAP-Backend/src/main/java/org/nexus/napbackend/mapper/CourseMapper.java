package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.CourseResponse;
import org.nexus.napbackend.model.Course;

public final class CourseMapper {

    private CourseMapper() {}

    public static CourseResponse toDto(Course entity) {
        if (entity == null) return null;
        return new CourseResponse(
            entity.getId(),
            entity.getCode(),
            entity.getName(),
            entity.getCollege(),
            entity.getDepartment(),
            entity.getDurationYears()
        );
    }
}
