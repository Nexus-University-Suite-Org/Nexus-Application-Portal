package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;

public record ProgramCategoryRequest(
        @NotBlank String name,
        String description,
        Integer displayOrder
) {}
