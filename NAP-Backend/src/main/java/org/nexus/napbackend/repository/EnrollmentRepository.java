package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByStudentIdOrderByEnrolledAtDesc(String studentId);

    List<Enrollment> findByCourseUnitIdAndStudentId(Long courseUnitId, String studentId);

    Optional<Enrollment> findByStudentIdAndCourseUnitId(String studentId, Long courseUnitId);

    boolean existsByStudentIdAndCourseUnitId(String studentId, Long courseUnitId);

    long countByStudentIdAndStatus(String studentId, String status);

    List<Enrollment> findByTenantIdAndStudentIdOrderByEnrolledAtDesc(Long tenantId, String studentId);

    Optional<Enrollment> findByIdAndTenantId(Long id, Long tenantId);

    Optional<Enrollment> findByTenantIdAndStudentIdAndCourseUnitId(
            Long tenantId, String studentId, Long courseUnitId);

    boolean existsByTenantIdAndStudentIdAndCourseUnitId(
            Long tenantId, String studentId, Long courseUnitId);

    long countByTenantIdAndStudentIdAndStatus(Long tenantId, String studentId, String status);
}
