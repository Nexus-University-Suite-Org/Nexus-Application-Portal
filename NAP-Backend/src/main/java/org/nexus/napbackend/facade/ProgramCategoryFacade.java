package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.ProgramCategoryRequest;
import org.nexus.napbackend.dto.ProgramCategoryResponse;
import org.nexus.napbackend.mapper.ProgramCategoryMapper;
import org.nexus.napbackend.model.ProgramCategory;
import org.nexus.napbackend.service.ProgramCategoryService;
import org.nexus.napbackend.service.ProgramService;
import org.springframework.stereotype.Component;

@Component
public class ProgramCategoryFacade {

    private final ProgramCategoryService categoryService;
    private final ProgramService programService;

    public ProgramCategoryFacade(ProgramCategoryService categoryService, ProgramService programService) {
        this.categoryService = categoryService;
        this.programService = programService;
    }

    @Transactional
    public ProgramCategoryResponse create(ProgramCategoryRequest request) {
        ProgramCategory entity = ProgramCategoryMapper.toEntity(request);
        ProgramCategory saved = categoryService.create(entity);
        return toDto(saved);
    }

    @Transactional
    public ProgramCategoryResponse findById(Long id) {
        ProgramCategory entity = categoryService.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return toDto(entity);
    }

    @Transactional
    public List<ProgramCategoryResponse> findAll() {
        return categoryService.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ProgramCategoryResponse update(Long id, ProgramCategoryRequest request) {
        ProgramCategory entity = categoryService.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        ProgramCategoryMapper.updateEntity(entity, request);
        ProgramCategory updated = categoryService.update(id, entity);
        return toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        categoryService.delete(id);
    }

    private ProgramCategoryResponse toDto(ProgramCategory entity) {
        List<Long> programIds = categoryService.findProgramIdsByCategoryId(entity.getId());
        List<ProgramCategoryResponse.ProgramSummary> programs = programIds.stream()
                .map(pid -> programService.findById(pid)
                        .map(p -> new ProgramCategoryResponse.ProgramSummary(p.getId(), p.getProgramName(), p.getProgramCode(), p.getProgramType()))
                        .orElse(null))
                .filter(p -> p != null)
                .toList();
        return ProgramCategoryMapper.toDto(entity, programs);
    }
}
