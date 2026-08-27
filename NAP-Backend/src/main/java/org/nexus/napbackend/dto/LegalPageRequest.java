package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record LegalPageRequest(
        @NotBlank @Size(max = 500) String title,
        @NotBlank @Size(max = 200) String slug,
        @NotBlank @Size(max = 50) String type,
        @Size(max = 20) String version,
        LocalDate updatedDate,
        @NotBlank String content
) {}
