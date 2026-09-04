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
    private final NewsletterNotificationService newsletterNotificationService;

    public SiteSettingService(SiteSettingRepository repository,
                              NewsletterNotificationService newsletterNotificationService) {
        this.repository = repository;
        this.newsletterNotificationService = newsletterNotificationService;
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
        SiteSetting saved;
        Optional<SiteSetting> existing = repository.findByTenantIdAndSettingKey(DEMO_TENANT_ID, settingKey);
        if (existing.isPresent()) {
            SiteSetting entity = existing.get();
            entity.setSettingValue(settingValue);
            entity.setUpdatedAt(LocalDateTime.now());
            saved = repository.save(entity);
        } else {
            SiteSetting entity = new SiteSetting();
            entity.setTenantId(DEMO_TENANT_ID);
            entity.setSettingKey(settingKey);
            entity.setSettingValue(settingValue);
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
            saved = repository.save(entity);
        }
        if (isNewsSetting(settingKey)) {
            newsletterNotificationService.broadcastNewsUpdate(settingKey, settingValue);
        }
        return saved;
    }

    private boolean isNewsSetting(String settingKey) {
        if (settingKey == null) {
            return false;
        }
        return settingKey.equals("news_articles")
                || settingKey.equals("news_events")
                || settingKey.startsWith("news_featured_");
    }

    public void delete(String settingKey) {
        repository.deleteByTenantIdAndSettingKey(DEMO_TENANT_ID, settingKey);
    }
}
