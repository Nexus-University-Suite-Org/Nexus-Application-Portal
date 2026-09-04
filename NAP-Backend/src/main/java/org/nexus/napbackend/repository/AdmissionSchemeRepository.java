package org.nexus.napbackend.repository;

import java.util.Collection;
import java.util.List;
import org.nexus.napbackend.model.AdmissionScheme;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdmissionSchemeRepository extends JpaRepository<AdmissionScheme, Long> {

    List<AdmissionScheme> findAllByOrderByAppCloseDateAsc();

    List<AdmissionScheme> findByStatusInOrderByAppCloseDateAsc(Collection<String> statuses);

    List<AdmissionScheme> findByPrograms_IdOrderByAppCloseDateAsc(Long programId);
}
