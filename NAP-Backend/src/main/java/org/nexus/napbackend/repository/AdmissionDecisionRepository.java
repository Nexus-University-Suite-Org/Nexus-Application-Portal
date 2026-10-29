package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.AdmissionDecision;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdmissionDecisionRepository extends JpaRepository<AdmissionDecision, Long> {

    List<AdmissionDecision> findByApplicationIdOrderByIdAsc(Long applicationId);

    List<AdmissionDecision> findByProgrammeCodeOrderByAdmissionIndexDesc(String programmeCode);
}
