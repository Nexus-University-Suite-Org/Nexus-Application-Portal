package org.nexus.napbackend.repository;

import java.util.Optional;
import org.nexus.napbackend.model.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpRepository extends JpaRepository<OtpCode, Long> {

    Optional<OtpCode> findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(String email, String purpose);

    Optional<OtpCode> findTopByTenantIdAndEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            Long tenantId, String email, String purpose);
}
