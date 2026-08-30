package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.SiteSettingRequest;
import org.nexus.napbackend.dto.SiteSettingResponse;
import org.nexus.napbackend.model.SiteSetting;

public final class SiteSettingMapper {

    private SiteSettingMapper() {}

    public static SiteSetting toEntity(SiteSettingRequest request) {
        SiteSetting entity = new SiteSetting();
        entity.setSettingKey(request.settingKey());
        entity.setSettingValue(request.settingValue());
        return entity;
    }

    public static SiteSettingResponse toDto(SiteSetting entity) {
        return new SiteSettingResponse(
                entity.getId(),
                entity.getTenantId(),
                entity.getSettingKey(),
                entity.getSettingValue(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static void updateEntity(SiteSetting entity, SiteSettingRequest request) {
        entity.setSettingKey(request.settingKey());
        entity.setSettingValue(request.settingValue());
    }
}
