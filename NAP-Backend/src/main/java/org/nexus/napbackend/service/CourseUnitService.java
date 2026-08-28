package org.nexus.napbackend.service;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.CourseUnit;
import org.nexus.napbackend.repository.CourseUnitRepository;
import org.springframework.stereotype.Service;

@Service
public class CourseUnitService {

    private static final Long DEMO_TENANT_ID = 1L;
    private final CourseUnitRepository repository;

    public CourseUnitService(CourseUnitRepository repository) {
        this.repository = repository;
    }

    public List<CourseUnit> findByCourseId(Long courseId) {
        return repository.findByCourseId(courseId);
    }

    public List<CourseUnit> findByCourseIdAndSemesterAndYear(Long courseId, Integer semester, Integer year) {
        return repository.findByCourseIdAndSemesterAndYear(courseId, semester, year);
    }

    public Optional<CourseUnit> findById(Long id) {
        return repository.findById(id);
    }

    public CourseUnit create(CourseUnit unit) {
        unit.setTenantId(DEMO_TENANT_ID);
        return repository.save(unit);
    }

    public List<CourseUnit> createAll(List<CourseUnit> units) {
        units.forEach(u -> u.setTenantId(DEMO_TENANT_ID));
        return repository.saveAll(units);
    }
}
