package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.FeeAssignmentRequest;
import org.nexus.napbackend.dto.FeeAssignmentResponse;
import org.nexus.napbackend.dto.FeeReportResponse;
import org.nexus.napbackend.model.FeeAssignment;

public final class FeeAssignmentMapper {

    private FeeAssignmentMapper() {
    }

    public static FeeAssignment toEntity(FeeAssignmentRequest request) {
        FeeAssignment entity = new FeeAssignment();
        entity.setItemName(request.itemName());
        entity.setCategory(request.category());
        entity.setYearLevel(request.yearLevel());
        entity.setSemester(request.semester());
        entity.setAcademicYear(request.academicYear());
        entity.setAmount(request.amount());
        entity.setCurrency(request.currency() != null ? request.currency() : "UGX");
        entity.setCollege(request.college());
        entity.setNotes(request.notes());
        return entity;
    }

    public static FeeAssignmentResponse toDto(FeeAssignment entity) {
        return new FeeAssignmentResponse(
                entity.getId(),
                entity.getItemName(),
                entity.getCategory(),
                entity.getYearLevel(),
                entity.getSemester(),
                entity.getAcademicYear(),
                entity.getAmount(),
                entity.getCurrency(),
                entity.getCollege(),
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static FeeReportResponse toReportDto(FeeAssignment entity) {
        return new FeeReportResponse(
                entity.getAcademicYear(),
                entity.getCollege(),
                entity.getCategory(),
                entity.getYearLevel(),
                entity.getSemester(),
                entity.getItemName(),
                entity.getAmount(),
                entity.getCurrency(),
                0L,
                java.math.BigDecimal.ZERO,
                java.math.BigDecimal.ZERO
        );
    }
}
