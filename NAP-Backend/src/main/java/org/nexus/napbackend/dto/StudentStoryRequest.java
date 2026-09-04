package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StudentStoryRequest(
        @NotBlank @Size(max = 500) String title,
        @NotBlank String content,
        @Size(max = 300) String studentName,
        @Size(max = 300) String author,
        @Size(max = 300) String program,
        Integer graduationYear,
        @Size(max = 1000) String imageUrl,
        @NotNull Boolean featured
) {}
