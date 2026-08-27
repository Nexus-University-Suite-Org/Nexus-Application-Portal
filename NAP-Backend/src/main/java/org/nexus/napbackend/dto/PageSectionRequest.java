package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PageSectionRequest(
        @NotBlank @Size(max = 100) String pageKey,
        @NotBlank @Size(max = 100) String sectionKey,
        @Size(max = 500) String title,
        @Size(max = 1000) String subtitle,
        String body,
        @Size(max = 500) String imageUrl
) {}
