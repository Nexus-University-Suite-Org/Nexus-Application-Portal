package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import org.nexus.napbackend.dto.EnrollmentCreateRequest;
import org.nexus.napbackend.dto.EnrollmentResponse;
import org.nexus.napbackend.mapper.EnrollmentMapper;
import org.nexus.napbackend.model.CourseUnit;
import org.nexus.napbackend.model.Enrollment;
import org.nexus.napbackend.service.CourseUnitService;
import org.nexus.napbackend.service.EnrollmentService;
import org.springframework.stereotype.Component;

@Component
public class EnrollmentFacade {

    private final EnrollmentService enrollmentService;
    private final CourseUnitService courseUnitService;

    public EnrollmentFacade(EnrollmentService enrollmentService, CourseUnitService courseUnitService) {
        this.enrollmentService = enrollmentService;
        this.courseUnitService = courseUnitService;
    }

    public List<EnrollmentResponse> findByStudentId(String studentId) {
        return enrollmentService.findByStudentId(studentId).stream()
                .map(EnrollmentMapper::toDto)
                .toList();
    }

    @Transactional
    public List<EnrollmentResponse> createEnrollments(EnrollmentCreateRequest request) {
        List<Enrollment> enrollments = new ArrayList<>();

        for (Long courseUnitId : request.courseIds()) {
            if (!enrollmentService.existsByStudentAndCourseUnit(request.studentId(), courseUnitId)) {
                CourseUnit unit = courseUnitService.findById(courseUnitId)
                        .orElseThrow(() -> new RuntimeException("Course unit not found: " + courseUnitId));

                Enrollment enrollment = new Enrollment();
                enrollment.setStudentId(request.studentId());
                enrollment.setCourseUnit(unit);
                enrollment.setStatus("pending");
                enrollments.add(enrollment);
            }
        }

        List<Enrollment> saved = enrollmentService.createAll(enrollments);
        return saved.stream()
                .map(EnrollmentMapper::toDto)
                .toList();
    }

    @Transactional
    public EnrollmentResponse updateStatus(Long id, String status) {
        Enrollment enrollment = enrollmentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found: " + id));
        enrollment.setStatus(status.toLowerCase());
        Enrollment updated = enrollmentService.update(enrollment);
        return EnrollmentMapper.toDto(updated);
    }
}
