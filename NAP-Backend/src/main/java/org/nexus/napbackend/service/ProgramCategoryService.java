package org.nexus.napbackend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.ProgramCategory;
import org.nexus.napbackend.model.ProgramCategoryProgram;
import org.nexus.napbackend.repository.ProgramCategoryProgramRepository;
import org.nexus.napbackend.repository.ProgramCategoryRepository;
import org.springframework.stereotype.Service;

@Service
public class ProgramCategoryService {

    private final ProgramCategoryRepository categoryRepository;
    private final ProgramCategoryProgramRepository linkRepository;

    public ProgramCategoryService(ProgramCategoryRepository categoryRepository,
                                   ProgramCategoryProgramRepository linkRepository) {
        this.categoryRepository = categoryRepository;
        this.linkRepository = linkRepository;
    }

    public ProgramCategory create(ProgramCategory entity) {
        return categoryRepository.save(entity);
    }

    public Optional<ProgramCategory> findById(Long id) {
        return categoryRepository.findById(id);
    }

    public List<ProgramCategory> findAll() {
        return categoryRepository.findAllByOrderByDisplayOrderAscNameAsc();
    }

    public ProgramCategory update(Long id, ProgramCategory entity) {
        entity.setId(id);
        return categoryRepository.save(entity);
    }

    public void delete(Long id) {
        linkRepository.findByCategoryId(id).forEach(linkRepository::delete);
        categoryRepository.deleteById(id);
    }

    public boolean existsByName(String name) {
        return categoryRepository.existsByNameIgnoreCase(name);
    }

    public List<Long> findProgramIdsByCategoryId(Long categoryId) {
        return linkRepository.findByCategoryId(categoryId).stream()
                .map(ProgramCategoryProgram::getProgramId)
                .toList();
    }

    public List<Long> findCategoryIdsByProgramId(Long programId) {
        return linkRepository.findByProgramId(programId).stream()
                .map(ProgramCategoryProgram::getCategoryId)
                .toList();
    }

    public void assignProgramToCategory(Long categoryId, Long programId) {
        if (!linkRepository.existsByCategoryIdAndProgramId(categoryId, programId)) {
            ProgramCategoryProgram link = new ProgramCategoryProgram();
            link.setCategoryId(categoryId);
            link.setProgramId(programId);
            linkRepository.save(link);
        }
    }

    public void removeProgramFromCategory(Long categoryId, Long programId) {
        linkRepository.deleteByCategoryIdAndProgramId(categoryId, programId);
    }

    public List<Long> findCategoryIdsByProgramIds(List<Long> programIds) {
        List<Long> allCategoryIds = new ArrayList<>();
        for (Long programId : programIds) {
            allCategoryIds.addAll(findCategoryIdsByProgramId(programId));
        }
        return allCategoryIds;
    }
}
