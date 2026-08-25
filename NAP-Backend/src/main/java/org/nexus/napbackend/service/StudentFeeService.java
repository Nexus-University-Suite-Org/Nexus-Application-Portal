package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.StudentFee;
import org.nexus.napbackend.repository.StudentFeeRepository;
import org.springframework.stereotype.Service;

@Service
public class StudentFeeService {

    private static final Long DEMO_TENANT_ID = 1L;

    private final StudentFeeRepository repository;

    public StudentFeeService(StudentFeeRepository repository) {
        this.repository = repository;
    }

    public StudentFee create(StudentFee entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public StudentFee update(StudentFee entity) {
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<StudentFee> findById(Long id) {
        return repository.findById(id);
    }

    public List<StudentFee> findByStudentId(Long studentId) {
        return repository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<StudentFee> findByStudentIdAndStatus(Long studentId, String status) {
        return repository.findByStudentIdAndStatusOrderByDueDateAsc(studentId, status);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
