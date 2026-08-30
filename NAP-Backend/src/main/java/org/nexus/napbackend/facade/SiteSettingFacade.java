package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.nexus.napbackend.dto.SiteSettingRequest;
import org.nexus.napbackend.dto.SiteSettingResponse;
import org.nexus.napbackend.mapper.SiteSettingMapper;
import org.nexus.napbackend.model.SiteSetting;
import org.nexus.napbackend.service.SiteSettingService;
import org.springframework.stereotype.Component;

@Component
public class SiteSettingFacade {

    private final SiteSettingService service;

    public SiteSettingFacade(SiteSettingService service) {
        this.service = service;
    }

    @Transactional
    public SiteSettingResponse upsert(SiteSettingRequest request) {
        SiteSetting saved = service.upsert(request.settingKey(), request.settingValue());
        return SiteSettingMapper.toDto(saved);
    }

    @Transactional
    public SiteSettingResponse findByKey(String settingKey) {
        SiteSetting entity = service.findByKey(settingKey)
                .orElseThrow(() -> new RuntimeException("Site setting not found: " + settingKey));
        return SiteSettingMapper.toDto(entity);
    }

    @Transactional
    public List<SiteSettingResponse> findAll() {
        return service.findAll().stream()
                .map(SiteSettingMapper::toDto)
                .toList();
    }

    @Transactional
    public Map<String, String> findAllAsMap() {
        return service.findAll().stream()
                .collect(Collectors.toMap(
                        SiteSetting::getSettingKey,
                        SiteSetting::getSettingValue,
                        (a, b) -> b
                ));
    }

    @Transactional
    public void delete(String settingKey) {
        service.delete(settingKey);
    }
}
