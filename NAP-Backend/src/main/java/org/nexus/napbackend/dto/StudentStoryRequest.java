package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StudentStoryRequest(
        @NotBlank @Size(max = 500) String title,
        @NotBlank String content,
        @Size(max = 200) String author,
        @NotNull Boolean featured
) {}
