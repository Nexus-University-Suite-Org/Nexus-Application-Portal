package org.nexus.napbackend.service;

import org.nexus.napbackend.tenancy.TenantContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.FeeAssignment;
import org.nexus.napbackend.repository.FeeAssignmentRepository;
import org.springframework.stereotype.Service;

@Service
public class FeeAssignmentService {

    private final FeeAssignmentRepository repository;

    public FeeAssignmentService(FeeAssignmentRepository repository) {
        this.repository = repository;
    }

    public FeeAssignment create(FeeAssignment entity) {
        entity.setTenantId(TenantContext.getCurrentTenantId());
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public FeeAssignment update(FeeAssignment entity) {
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<FeeAssignment> findById(Long id) {
        return repository.findByIdAndTenantId(id, TenantContext.getCurrentTenantId());
    }

    public List<FeeAssignment> findAll() {
        return repository.findByTenantIdOrderByAcademicYearDescYearLevelAscSemesterAsc(
                TenantContext.getCurrentTenantId());
    }

    public List<FeeAssignment> findByCollege(String college) {
        return repository.findByTenantIdAndCollegeOrderByAcademicYearDescYearLevelAscSemesterAsc(
                TenantContext.getCurrentTenantId(), college);
    }

    public List<FeeAssignment> findByAcademicYear(String academicYear) {
        return repository.findByTenantIdAndAcademicYearOrderByYearLevelAscSemesterAsc(
                TenantContext.getCurrentTenantId(), academicYear);
    }

    public void deleteById(Long id) {
        repository.findByIdAndTenantId(id, TenantContext.getCurrentTenantId())
                .ifPresent(repository::delete);
    }

    public List<FeeAssignment> findAllForReport() {
        return repository.findAllByTenantIdForReport(TenantContext.getCurrentTenantId());
    }

    public List<FeeAssignment> findByAcademicYearForReport(String academicYear) {
        return repository.findByTenantIdAndAcademicYearForReport(
                TenantContext.getCurrentTenantId(), academicYear);
    }
}
