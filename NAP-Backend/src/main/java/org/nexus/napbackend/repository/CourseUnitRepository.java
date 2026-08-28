package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.CourseUnit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseUnitRepository extends JpaRepository<CourseUnit, Long> {

    List<CourseUnit> findByCourseId(Long courseId);

    List<CourseUnit> findByCourseIdAndSemesterAndYear(Long courseId, Integer semester, Integer year);

    boolean existsByCourseIdAndCodeIgnoreCase(Long courseId, String code);
}
