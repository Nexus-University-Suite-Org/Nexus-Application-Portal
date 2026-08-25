package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AnnouncementCreateRequest(
        @NotNull Long authorId,
        @NotBlank @Size(max = 500) String title,
        @NotBlank String body,
        Long courseId,
        Boolean isSystemWide
) {
}
