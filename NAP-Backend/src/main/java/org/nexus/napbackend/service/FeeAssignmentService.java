package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.FeeAssignment;
import org.nexus.napbackend.repository.FeeAssignmentRepository;
import org.springframework.stereotype.Service;

@Service
public class FeeAssignmentService {

    private static final Long DEMO_TENANT_ID = 1L;

    private final FeeAssignmentRepository repository;

    public FeeAssignmentService(FeeAssignmentRepository repository) {
        this.repository = repository;
    }

    public FeeAssignment create(FeeAssignment entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public FeeAssignment update(FeeAssignment entity) {
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<FeeAssignment> findById(Long id) {
        return repository.findById(id);
    }

    public List<FeeAssignment> findAll() {
        return repository.findAllByOrderByAcademicYearDescYearLevelAscSemesterAsc();
    }

    public List<FeeAssignment> findByCollege(String college) {
        return repository.findByCollegeOrderByAcademicYearDescYearLevelAscSemesterAsc(college);
    }

    public List<FeeAssignment> findByAcademicYear(String academicYear) {
        return repository.findByAcademicYearOrderByYearLevelAscSemesterAsc(academicYear);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
