package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateTenantStatusRequest(
        @NotNull Boolean active
) {
}