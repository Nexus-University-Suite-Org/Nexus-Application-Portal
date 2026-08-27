package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PartnerRequest(
        @NotBlank Long tenantId,
        @NotBlank @Size(max = 200) String name,
        @Size(max = 500) String description,
        @Size(max = 500) String logoUrl,
        @Size(max = 500) String websiteUrl
) {}
