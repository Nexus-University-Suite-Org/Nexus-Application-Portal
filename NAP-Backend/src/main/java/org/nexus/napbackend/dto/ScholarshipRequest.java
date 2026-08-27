package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record ScholarshipRequest(
        @NotNull Long tenantId,
        @NotBlank @Size(max = 500) String title,
        @NotBlank String description,
        @Size(max = 1000) String eligibility,
        LocalDateTime deadline
) {}
