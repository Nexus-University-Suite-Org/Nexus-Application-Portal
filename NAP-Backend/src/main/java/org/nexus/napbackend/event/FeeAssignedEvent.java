package org.nexus.napbackend.event;

import java.math.BigDecimal;

public class FeeAssignedEvent {

    private final Long studentFeeId;
    private final Long studentId;
    private final Long feeAssignmentId;
    private final BigDecimal amount;

    public FeeAssignedEvent(Long studentFeeId, Long studentId, Long feeAssignmentId, BigDecimal amount) {
        this.studentFeeId = studentFeeId;
        this.studentId = studentId;
        this.feeAssignmentId = feeAssignmentId;
        this.amount = amount;
    }

    public Long getStudentFeeId() {
        return studentFeeId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public Long getFeeAssignmentId() {
        return feeAssignmentId;
    }

    public BigDecimal getAmount() {
        return amount;
    }
}
