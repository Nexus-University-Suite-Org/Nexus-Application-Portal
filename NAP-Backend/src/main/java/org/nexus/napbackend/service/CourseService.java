package org.nexus.napbackend.service;

import org.nexus.napbackend.tenancy.TenantContext;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Course;
import org.nexus.napbackend.repository.CourseRepository;
import org.springframework.stereotype.Service;

@Service
public class CourseService {
    private final CourseRepository repository;

    public CourseService(CourseRepository repository) {
        this.repository = repository;
    }

    public List<Course> findAll() {
        return repository.findAllByTenantId(TenantContext.getCurrentTenantId());
    }

    public Optional<Course> findById(Long id) {
        return repository.findByIdAndTenantId(id, TenantContext.getCurrentTenantId());
    }

    public Optional<Course> findByName(String name) {
        return repository.findByTenantIdAndNameIgnoreCase(TenantContext.getCurrentTenantId(), name);
    }

    public Optional<Course> findByCode(String code) {
        return repository.findByTenantIdAndCodeIgnoreCase(TenantContext.getCurrentTenantId(), code);
    }

    public Course create(Course course) {
        course.setTenantId(TenantContext.getCurrentTenantId());
        return repository.save(course);
    }

    public boolean existsByCode(String code) {
        return repository.existsByTenantIdAndCodeIgnoreCase(
                TenantContext.getCurrentTenantId(), code);
    }
}
