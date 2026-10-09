package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findByNameIgnoreCase(String name);

    Optional<Course> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<Course> findAllByTenantId(Long tenantId);

    Optional<Course> findByIdAndTenantId(Long id, Long tenantId);

    Optional<Course> findByTenantIdAndNameIgnoreCase(Long tenantId, String name);

    Optional<Course> findByTenantIdAndCodeIgnoreCase(Long tenantId, String code);

    boolean existsByTenantIdAndCodeIgnoreCase(Long tenantId, String code);
}
