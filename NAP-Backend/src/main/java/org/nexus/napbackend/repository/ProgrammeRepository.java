package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Programme;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgrammeRepository extends JpaRepository<Programme, Long> {

    Optional<Programme> findByCode(String code);

    List<Programme> findAllByIsActiveTrue();

    List<Programme> findAllByIsActiveTrueOrderByCode();

    boolean existsByCode(String code);
}
