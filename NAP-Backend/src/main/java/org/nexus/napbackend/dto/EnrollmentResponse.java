package org.nexus.napbackend.dto;

public record EnrollmentResponse(
    Long id,
    String status,
    String enrolledAt,
    Object grade,
    CourseEnrollment course
) {
    public record CourseEnrollment(
        String code,
        String title,
        Integer credits,
        String semester,
        Integer year
    ) {}
}
