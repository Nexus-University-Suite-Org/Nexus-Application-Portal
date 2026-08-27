package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record CmsEventRequest(
        @NotBlank @Size(max = 500) String title,
        @Size(max = 1000) String description,
        LocalDateTime eventDate,
        @Size(max = 500) String imageUrl,
        Boolean published
) {}
