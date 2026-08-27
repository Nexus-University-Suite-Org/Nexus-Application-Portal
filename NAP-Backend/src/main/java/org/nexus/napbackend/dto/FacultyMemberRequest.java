package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FacultyMemberRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 200) String title,
        @Size(max = 200) String department,
        @Size(max = 1000) String bio,
        @Size(max = 320) String email,
        @Size(max = 500) String specialization,
        @NotNull Integer displayOrder
) {}
