package org.nexus.napbackend.dto;

import java.util.List;

public record EnrollmentCreateRequest(
    String studentId,
    List<Long> courseIds
) {}
