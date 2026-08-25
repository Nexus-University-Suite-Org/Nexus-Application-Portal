package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findAllByOrderByCreatedAtDesc();

    List<Announcement> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    List<Announcement> findByIsSystemWideTrueOrderByCreatedAtDesc();
}
