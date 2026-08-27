package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record FacultyMemberResponse(
        Long id,
        String name,
        String title,
        String department,
        String bio,
        String email,
        String specialization,
        Integer displayOrder,
        LocalDateTime createdAt
) {}
