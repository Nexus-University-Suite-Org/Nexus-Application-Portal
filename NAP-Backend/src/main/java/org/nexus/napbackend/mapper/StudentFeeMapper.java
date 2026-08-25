package org.nexus.napbackend.mapper;

import java.math.BigDecimal;
import org.nexus.napbackend.dto.StudentFeeRequest;
import org.nexus.napbackend.dto.StudentFeeResponse;
import org.nexus.napbackend.model.StudentFee;

public final class StudentFeeMapper {

    private StudentFeeMapper() {
    }

    public static StudentFee toEntity(StudentFeeRequest request) {
        StudentFee entity = new StudentFee();
        entity.setStudentId(request.studentId());
        entity.setFeeAssignmentId(request.feeAssignmentId());
        entity.setAmount(request.amount());
        entity.setPaidAmount(request.paidAmount());
        entity.setDueDate(request.dueDate());
        entity.setStatus(request.status() != null ? request.status() : "PENDING");
        return entity;
    }

    public static StudentFeeResponse toDto(StudentFee entity) {
        BigDecimal balance = entity.getAmount().subtract(entity.getPaidAmount());
        return new StudentFeeResponse(
                entity.getId(),
                entity.getStudentId(),
                entity.getFeeAssignmentId(),
                entity.getAmount(),
                entity.getPaidAmount(),
                balance,
                entity.getDueDate(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
