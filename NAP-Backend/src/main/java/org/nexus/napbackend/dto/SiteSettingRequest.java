package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SiteSettingRequest(
        @NotBlank @Size(max = 100) String settingKey,
        String settingValue
) {}
