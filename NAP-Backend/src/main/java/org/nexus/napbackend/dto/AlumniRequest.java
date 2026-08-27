package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlumniRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 200) String program,
        Integer graduationYear,
        @Size(max = 500) String bio,
        @Size(max = 500) String imageUrl
) {}
