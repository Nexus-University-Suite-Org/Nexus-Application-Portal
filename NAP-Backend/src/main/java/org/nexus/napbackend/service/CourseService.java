package org.nexus.napbackend.service;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Course;
import org.nexus.napbackend.repository.CourseRepository;
import org.springframework.stereotype.Service;

@Service
public class CourseService {

    private static final Long DEMO_TENANT_ID = 1L;
    private final CourseRepository repository;

    public CourseService(CourseRepository repository) {
        this.repository = repository;
    }

    public List<Course> findAll() {
        return repository.findAll();
    }

    public Optional<Course> findById(Long id) {
        return repository.findById(id);
    }

    public Optional<Course> findByName(String name) {
        return repository.findByNameIgnoreCase(name);
    }

    public Optional<Course> findByCode(String code) {
        return repository.findByCodeIgnoreCase(code);
    }

    public Course create(Course course) {
        course.setTenantId(DEMO_TENANT_ID);
        return repository.save(course);
    }

    public boolean existsByCode(String code) {
        return repository.existsByCodeIgnoreCase(code);
    }
}
