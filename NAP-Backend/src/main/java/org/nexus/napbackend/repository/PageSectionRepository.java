package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.PageSection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PageSectionRepository extends JpaRepository<PageSection, Long> {

    List<PageSection> findByPageKeyOrderByCreatedAtDesc(String pageKey);

    List<PageSection> findAllByOrderByCreatedAtDesc();
}
