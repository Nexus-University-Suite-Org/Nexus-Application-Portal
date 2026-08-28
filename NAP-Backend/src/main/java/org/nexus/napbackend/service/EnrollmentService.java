package org.nexus.napbackend.service;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Enrollment;
import org.nexus.napbackend.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

@Service
public class EnrollmentService {

    private static final Long DEMO_TENANT_ID = 1L;
    private final EnrollmentRepository repository;

    public EnrollmentService(EnrollmentRepository repository) {
        this.repository = repository;
    }

    public List<Enrollment> findByStudentId(String studentId) {
        return repository.findByStudentIdOrderByEnrolledAtDesc(studentId);
    }

    public Optional<Enrollment> findById(Long id) {
        return repository.findById(id);
    }

    public Optional<Enrollment> findByStudentAndCourseUnit(String studentId, Long courseUnitId) {
        return repository.findByStudentIdAndCourseUnitId(studentId, courseUnitId);
    }

    public boolean existsByStudentAndCourseUnit(String studentId, Long courseUnitId) {
        return repository.existsByStudentIdAndCourseUnitId(studentId, courseUnitId);
    }

    public Enrollment create(Enrollment enrollment) {
        enrollment.setTenantId(DEMO_TENANT_ID);
        return repository.save(enrollment);
    }

    public List<Enrollment> createAll(List<Enrollment> enrollments) {
        enrollments.forEach(e -> e.setTenantId(DEMO_TENANT_ID));
        return repository.saveAll(enrollments);
    }

    public Enrollment update(Enrollment enrollment) {
        return repository.save(enrollment);
    }
}
