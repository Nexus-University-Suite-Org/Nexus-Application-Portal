package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuickLinkRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 500) String url,
        @Size(max = 100) String icon,
        @NotNull Integer displayOrder
) {}
