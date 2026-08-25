package org.nexus.napbackend.event;

import java.math.BigDecimal;

public class PaymentRecordedEvent {

    private final Long studentFeeId;
    private final Long studentId;
    private final BigDecimal amountPaid;
    private final BigDecimal totalPaid;
    private final BigDecimal balance;

    public PaymentRecordedEvent(Long studentFeeId, Long studentId, BigDecimal amountPaid,
                                 BigDecimal totalPaid, BigDecimal balance) {
        this.studentFeeId = studentFeeId;
        this.studentId = studentId;
        this.amountPaid = amountPaid;
        this.totalPaid = totalPaid;
        this.balance = balance;
    }

    public Long getStudentFeeId() {
        return studentFeeId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}
