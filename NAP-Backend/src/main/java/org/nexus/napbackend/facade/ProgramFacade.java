package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.ProgramRequest;
import org.nexus.napbackend.dto.ProgramResponse;
import org.nexus.napbackend.mapper.ProgramMapper;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.service.ProgramCategoryService;
import org.nexus.napbackend.service.ProgramService;
import org.springframework.stereotype.Component;

@Component
public class ProgramFacade {

    private final ProgramService programService;
    private final ProgramCategoryService categoryService;

    public ProgramFacade(ProgramService programService, ProgramCategoryService categoryService) {
        this.programService = programService;
        this.categoryService = categoryService;
    }

    @Transactional
    public ProgramResponse create(ProgramRequest request, String userEmail) {
        Program entity = ProgramMapper.toEntity(request);
        entity.setCreatedBy(userEmail);
        Program saved = programService.create(entity);
        return toDto(saved);
    }

    @Transactional
    public ProgramResponse findById(Long id) {
        Program entity = programService.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found"));
        return toDto(entity);
    }

    @Transactional
    public List<ProgramResponse> findAll() {
        return programService.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<ProgramResponse> search(String query) {
        return programService.search(query).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<ProgramResponse> findByStatus(String status) {
        return programService.findByStatus(status).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<ProgramResponse> findByType(String type) {
        return programService.findByType(type).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ProgramResponse update(Long id, ProgramRequest request, String userEmail) {
        Program entity = programService.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found"));
        ProgramMapper.updateEntity(entity, request);
        entity.setUpdatedBy(userEmail);
        Program updated = programService.update(id, entity);
        return toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        programService.softDelete(id);
    }

    @Transactional
    public void assignCategory(Long programId, Long categoryId) {
        categoryService.assignProgramToCategory(categoryId, programId);
    }

    @Transactional
    public void removeCategory(Long programId, Long categoryId) {
        categoryService.removeProgramFromCategory(categoryId, programId);
    }

    private ProgramResponse toDto(Program entity) {
        List<String> categoryNames = categoryService.findCategoryIdsByProgramId(entity.getId()).stream()
                .map(catId -> categoryService.findById(catId)
                        .map(c -> c.getName())
                        .orElse("Unknown"))
                .toList();
        return ProgramMapper.toDto(entity, categoryNames);
    }
}
