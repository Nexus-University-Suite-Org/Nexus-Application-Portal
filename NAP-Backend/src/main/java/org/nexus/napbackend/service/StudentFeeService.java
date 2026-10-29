package org.nexus.napbackend.service;

import org.nexus.napbackend.tenancy.TenantContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.StudentFee;
import org.nexus.napbackend.repository.StudentFeeRepository;
import org.springframework.stereotype.Service;

@Service
public class StudentFeeService {

    private final StudentFeeRepository repository;

    public StudentFeeService(StudentFeeRepository repository) {
        this.repository = repository;
    }

    public StudentFee create(StudentFee entity) {
        entity.setTenantId(TenantContext.getCurrentTenantId());
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public StudentFee update(StudentFee entity) {
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<StudentFee> findById(Long id) {
        return repository.findByIdAndTenantId(id, TenantContext.getCurrentTenantId());
    }

    public List<StudentFee> findByStudentId(Long studentId) {
        return repository.findByTenantIdAndStudentIdOrderByCreatedAtDesc(
                TenantContext.getCurrentTenantId(), studentId);
    }

    public List<StudentFee> findByStudentIdAndStatus(Long studentId, String status) {
        return repository.findByTenantIdAndStudentIdAndStatusOrderByDueDateAsc(
                TenantContext.getCurrentTenantId(), studentId, status);
    }

    public void deleteById(Long id) {
        repository.findByIdAndTenantId(id, TenantContext.getCurrentTenantId())
                .ifPresent(repository::delete);
    }
}
