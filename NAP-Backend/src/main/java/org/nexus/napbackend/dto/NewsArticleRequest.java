package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NewsArticleRequest(
        @NotBlank @Size(max = 500) String title,
        @Size(max = 1000) String excerpt,
        @NotBlank String content,
        @Size(max = 100) String category,
        @Size(max = 500) String imageUrl,
        Boolean featured,
        Boolean published
) {}
