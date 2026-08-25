package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import org.nexus.napbackend.dto.StudentFeeRequest;
import org.nexus.napbackend.dto.StudentFeeResponse;
import org.nexus.napbackend.event.FeeAssignedEvent;
import org.nexus.napbackend.event.PaymentRecordedEvent;
import org.nexus.napbackend.mapper.StudentFeeMapper;
import org.nexus.napbackend.model.StudentFee;
import org.nexus.napbackend.service.StudentFeeService;
import org.springframework.context.ApplicationEventPublisher;

@Facade
public class StudentFeeFacade {

    private final StudentFeeService service;
    private final ApplicationEventPublisher eventPublisher;

    public StudentFeeFacade(StudentFeeService service, ApplicationEventPublisher eventPublisher) {
        this.service = service;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public StudentFeeResponse create(StudentFeeRequest request) {
        StudentFee entity = StudentFeeMapper.toEntity(request);
        StudentFee saved = service.create(entity);
        eventPublisher.publishEvent(new FeeAssignedEvent(
                saved.getId(),
                saved.getStudentId(),
                saved.getFeeAssignmentId(),
                saved.getAmount()
        ));
        return StudentFeeMapper.toDto(saved);
    }

    @Transactional
    public StudentFeeResponse update(Long id, StudentFeeRequest request) {
        StudentFee existing = service.findById(id)
                .orElseThrow(() -> new RuntimeException("StudentFee not found with id: " + id));
        existing.setStudentId(request.studentId());
        existing.setFeeAssignmentId(request.feeAssignmentId());
        existing.setAmount(request.amount());
        existing.setPaidAmount(request.paidAmount());
        existing.setDueDate(request.dueDate());
        existing.setStatus(request.status());
        StudentFee updated = service.update(existing);
        return StudentFeeMapper.toDto(updated);
    }

    @Transactional
    public StudentFeeResponse recordPayment(Long id, BigDecimal paymentAmount) {
        StudentFee existing = service.findById(id)
                .orElseThrow(() -> new RuntimeException("StudentFee not found with id: " + id));
        BigDecimal newTotalPaid = existing.getPaidAmount().add(paymentAmount);
        existing.setPaidAmount(newTotalPaid);
        if (newTotalPaid.compareTo(existing.getAmount()) >= 0) {
            existing.setStatus("PAID");
        } else if (newTotalPaid.compareTo(BigDecimal.ZERO) > 0) {
            existing.setStatus("PARTIAL");
        }
        StudentFee updated = service.update(existing);
        BigDecimal balance = updated.getAmount().subtract(updated.getPaidAmount());
        eventPublisher.publishEvent(new PaymentRecordedEvent(
                updated.getId(),
                updated.getStudentId(),
                paymentAmount,
                updated.getPaidAmount(),
                balance
        ));
        return StudentFeeMapper.toDto(updated);
    }

    @Transactional
    public StudentFeeResponse findById(Long id) {
        StudentFee entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("StudentFee not found with id: " + id));
        return StudentFeeMapper.toDto(entity);
    }

    @Transactional
    public List<StudentFeeResponse> findByStudentId(Long studentId) {
        return service.findByStudentId(studentId).stream()
                .map(StudentFeeMapper::toDto)
                .toList();
    }

    @Transactional
    public List<StudentFeeResponse> findByStudentIdAndStatus(Long studentId, String status) {
        return service.findByStudentIdAndStatus(studentId, status).stream()
                .map(StudentFeeMapper::toDto)
                .toList();
    }

    @Transactional
    public void delete(Long id) {
        service.findById(id)
                .orElseThrow(() -> new RuntimeException("StudentFee not found with id: " + id));
        service.deleteById(id);
    }
}
