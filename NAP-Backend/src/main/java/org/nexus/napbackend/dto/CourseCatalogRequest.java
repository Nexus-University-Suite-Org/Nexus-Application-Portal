package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CourseCatalogRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 100) String code,
        @Size(max = 200) String college,
        @Size(max = 50) String level,
        @Size(max = 50) String duration,
        Integer credits,
        @Size(max = 500) String imageUrl,
        Boolean published
) {}
