package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.FeeAssignmentRequest;
import org.nexus.napbackend.dto.FeeAssignmentResponse;
import org.nexus.napbackend.mapper.FeeAssignmentMapper;
import org.nexus.napbackend.model.FeeAssignment;
import org.nexus.napbackend.service.FeeAssignmentService;

@Facade
public class FeeAssignmentFacade {

    private final FeeAssignmentService service;

    public FeeAssignmentFacade(FeeAssignmentService service) {
        this.service = service;
    }

    @Transactional
    public FeeAssignmentResponse create(FeeAssignmentRequest request) {
        FeeAssignment entity = FeeAssignmentMapper.toEntity(request);
        FeeAssignment saved = service.create(entity);
        return FeeAssignmentMapper.toDto(saved);
    }

    @Transactional
    public FeeAssignmentResponse update(Long id, FeeAssignmentRequest request) {
        FeeAssignment existing = service.findById(id)
                .orElseThrow(() -> new RuntimeException("FeeAssignment not found with id: " + id));
        existing.setItemName(request.itemName());
        existing.setCategory(request.category());
        existing.setYearLevel(request.yearLevel());
        existing.setSemester(request.semester());
        existing.setAcademicYear(request.academicYear());
        existing.setAmount(request.amount());
        existing.setCurrency(request.currency() != null ? request.currency() : "UGX");
        existing.setCollege(request.college());
        existing.setNotes(request.notes());
        FeeAssignment updated = service.update(existing);
        return FeeAssignmentMapper.toDto(updated);
    }

    @Transactional
    public FeeAssignmentResponse findById(Long id) {
        FeeAssignment entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("FeeAssignment not found with id: " + id));
        return FeeAssignmentMapper.toDto(entity);
    }

    @Transactional
    public List<FeeAssignmentResponse> findAll() {
        return service.findAll().stream()
                .map(FeeAssignmentMapper::toDto)
                .toList();
    }

    @Transactional
    public List<FeeAssignmentResponse> findByCollege(String college) {
        return service.findByCollege(college).stream()
                .map(FeeAssignmentMapper::toDto)
                .toList();
    }

    @Transactional
    public List<FeeAssignmentResponse> findByAcademicYear(String academicYear) {
        return service.findByAcademicYear(academicYear).stream()
                .map(FeeAssignmentMapper::toDto)
                .toList();
    }

    @Transactional
    public void delete(Long id) {
        service.findById(id)
                .orElseThrow(() -> new RuntimeException("FeeAssignment not found with id: " + id));
        service.deleteById(id);
    }
}
