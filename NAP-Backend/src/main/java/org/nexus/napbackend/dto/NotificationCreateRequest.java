package org.nexus.napbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NotificationCreateRequest(
        @NotNull Long userId,
        @NotBlank @Size(max = 50) String type,
        @NotBlank @Size(max = 500) String title,
        @NotBlank String message,
        Long relatedId,
        String link
) {
}
