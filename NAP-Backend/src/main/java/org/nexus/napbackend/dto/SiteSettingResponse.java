package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record SiteSettingResponse(
        Long id,
        String settingKey,
        String settingValue,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
