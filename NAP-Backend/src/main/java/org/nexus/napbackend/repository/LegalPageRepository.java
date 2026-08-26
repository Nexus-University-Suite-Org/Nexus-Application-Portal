package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.LegalPage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LegalPageRepository extends JpaRepository<LegalPage, Long> {

    List<LegalPage> findAllByOrderByCreatedAtDesc();

    Optional<LegalPage> findBySlug(String slug);
}
