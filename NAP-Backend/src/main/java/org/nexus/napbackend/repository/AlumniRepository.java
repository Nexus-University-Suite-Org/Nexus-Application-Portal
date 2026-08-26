package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.Alumni;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlumniRepository extends JpaRepository<Alumni, Long> {

    List<Alumni> findAllByOrderByCreatedAtDesc();
}
