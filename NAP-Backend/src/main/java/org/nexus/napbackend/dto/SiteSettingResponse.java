package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record SiteSettingResponse(
        Long id,
        Long tenantId,
        String settingKey,
        String settingValue,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
