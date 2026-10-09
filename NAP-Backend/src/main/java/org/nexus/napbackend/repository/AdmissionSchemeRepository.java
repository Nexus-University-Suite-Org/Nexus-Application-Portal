package org.nexus.napbackend.repository;

import java.util.Collection;
import java.util.List;
import org.nexus.napbackend.model.AdmissionScheme;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdmissionSchemeRepository extends JpaRepository<AdmissionScheme, Long> {

    List<AdmissionScheme> findAllByOrderByAppCloseDateAsc();

    List<AdmissionScheme> findByTenantIdOrderByAppCloseDateAsc(Long tenantId);

    List<AdmissionScheme> findByStatusInOrderByAppCloseDateAsc(Collection<String> statuses);

    List<AdmissionScheme> findByTenantIdAndStatusInOrderByAppCloseDateAsc(Long tenantId, Collection<String> statuses);

    List<AdmissionScheme> findByPrograms_IdOrderByAppCloseDateAsc(Long programId);

    List<AdmissionScheme> findByTenantIdAndPrograms_IdOrderByAppCloseDateAsc(Long tenantId, Long programId);
}
