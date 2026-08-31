package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.SiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteSettingRepository extends JpaRepository<SiteSetting, Long> {

    Optional<SiteSetting> findByTenantIdAndSettingKey(Long tenantId, String settingKey);

    List<SiteSetting> findByTenantIdOrderBySettingKey(Long tenantId);

    void deleteByTenantIdAndSettingKey(Long tenantId, String settingKey);
}
