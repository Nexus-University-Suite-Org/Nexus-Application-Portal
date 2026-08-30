package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.SiteSetting;
import org.nexus.napbackend.repository.SiteSettingRepository;
import org.springframework.stereotype.Service;

@Service
public class SiteSettingService {

    private static final Long DEMO_TENANT_ID = 1L;
    private final SiteSettingRepository repository;

    public SiteSettingService(SiteSettingRepository repository) {
        this.repository = repository;
    }

    public SiteSetting create(SiteSetting entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<SiteSetting> findByKey(String settingKey) {
        return repository.findByTenantIdAndSettingKey(DEMO_TENANT_ID, settingKey);
    }

    public List<SiteSetting> findAll() {
        return repository.findByTenantIdOrderBySettingKey(DEMO_TENANT_ID);
    }

    public SiteSetting upsert(String settingKey, String settingValue) {
        Optional<SiteSetting> existing = repository.findByTenantIdAndSettingKey(DEMO_TENANT_ID, settingKey);
        if (existing.isPresent()) {
            SiteSetting entity = existing.get();
            entity.setSettingValue(settingValue);
            entity.setUpdatedAt(LocalDateTime.now());
            return repository.save(entity);
        }
        SiteSetting entity = new SiteSetting();
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setSettingKey(settingKey);
        entity.setSettingValue(settingValue);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public void delete(String settingKey) {
        repository.deleteByTenantIdAndSettingKey(DEMO_TENANT_ID, settingKey);
    }
}
