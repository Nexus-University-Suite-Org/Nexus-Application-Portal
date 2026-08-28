package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.EnrollmentResponse;
import org.nexus.napbackend.model.Enrollment;

public final class EnrollmentMapper {

    private EnrollmentMapper() {}

    public static EnrollmentResponse toDto(Enrollment entity) {
        if (entity == null) return null;

        EnrollmentResponse.CourseEnrollment course = null;
        if (entity.getCourseUnit() != null) {
            var unit = entity.getCourseUnit();
            course = new EnrollmentResponse.CourseEnrollment(
                unit.getCode(),
                unit.getName(),
                unit.getCredits(),
                "Semester " + unit.getSemester(),
                unit.getYear()
            );
        }

        return new EnrollmentResponse(
            entity.getId(),
            entity.getStatus(),
            entity.getEnrolledAt() != null ? entity.getEnrolledAt().toString() : null,
            entity.getGrade(),
            course
        );
    }
}
