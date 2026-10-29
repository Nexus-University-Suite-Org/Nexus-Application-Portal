package org.nexus.napbackend.repository;

import java.util.Optional;
import org.nexus.napbackend.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    Optional<Tenant> findByCodeIgnoreCase(String code);

    Optional<Tenant> findByDomainIgnoreCase(String domain);

    boolean existsByCodeIgnoreCase(String code);
}
