package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record AlumniResponse(
        Long id,
        String name,
        String program,
        Integer graduationYear,
        String bio,
        String imageUrl,
        LocalDateTime createdAt
) {}
