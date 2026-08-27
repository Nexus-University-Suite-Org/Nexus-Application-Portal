package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FaqRequest(
        @Size(max = 200) String category,
        @NotBlank String question,
        @NotBlank String answer,
        @NotNull Integer displayOrder
) {}
