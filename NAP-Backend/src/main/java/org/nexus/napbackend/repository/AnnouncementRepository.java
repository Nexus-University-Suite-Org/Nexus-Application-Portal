package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findAllByOrderByCreatedAtDesc();

    List<Announcement> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    List<Announcement> findByIsSystemWideTrueOrderByCreatedAtDesc();

    List<Announcement> findAllByTenantIdOrderByCreatedAtDesc(Long tenantId);

    List<Announcement> findByTenantIdAndCourseIdOrderByCreatedAtDesc(Long tenantId, Long courseId);

    List<Announcement> findByTenantIdAndIsSystemWideTrueOrderByCreatedAtDesc(Long tenantId);

    Optional<Announcement> findByIdAndTenantId(Long id, Long tenantId);
}
