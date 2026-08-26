package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.Scholarship;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScholarshipRepository extends JpaRepository<Scholarship, Long> {

    List<Scholarship> findAllByOrderByCreatedAtDesc();
}
