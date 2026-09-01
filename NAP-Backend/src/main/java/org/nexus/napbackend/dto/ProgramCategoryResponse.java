package org.nexus.napbackend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ProgramCategoryResponse(
        Long id,
        String name,
        String description,
        Integer displayOrder,
        LocalDateTime createdAt,
        List<ProgramSummary> programs
) {
    public record ProgramSummary(Long id, String programName, String programCode, String programType) {}
}
