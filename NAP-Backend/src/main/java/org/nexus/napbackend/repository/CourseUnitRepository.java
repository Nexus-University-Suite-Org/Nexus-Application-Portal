package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.CourseUnit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseUnitRepository extends JpaRepository<CourseUnit, Long> {

    List<CourseUnit> findByCourseId(Long courseId);

    List<CourseUnit> findByCourseIdAndSemesterAndYear(Long courseId, Integer semester, Integer year);

    boolean existsByCourseIdAndCodeIgnoreCase(Long courseId, String code);

    List<CourseUnit> findByTenantIdAndCourseId(Long tenantId, Long courseId);

    List<CourseUnit> findByTenantIdAndCourseIdAndSemesterAndYear(
            Long tenantId, Long courseId, Integer semester, Integer year);

    Optional<CourseUnit> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndCourseIdAndCodeIgnoreCase(Long tenantId, Long courseId, String code);
}
