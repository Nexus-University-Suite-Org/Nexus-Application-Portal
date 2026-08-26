package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.CourseCatalog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseCatalogRepository extends JpaRepository<CourseCatalog, Long> {

    List<CourseCatalog> findByPublishedTrueOrderByCreatedAtDesc();
}
