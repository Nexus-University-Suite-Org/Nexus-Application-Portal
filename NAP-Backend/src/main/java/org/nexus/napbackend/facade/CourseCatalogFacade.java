package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.CourseCatalogRequest;
import org.nexus.napbackend.dto.CourseCatalogResponse;
import org.nexus.napbackend.mapper.CourseCatalogMapper;
import org.nexus.napbackend.model.CourseCatalog;
import org.nexus.napbackend.service.CourseCatalogService;
import org.springframework.stereotype.Component;

@Component
public class CourseCatalogFacade {

    private final CourseCatalogService service;

    public CourseCatalogFacade(CourseCatalogService service) {
        this.service = service;
    }

    @Transactional
    public CourseCatalogResponse create(CourseCatalogRequest request) {
        CourseCatalog entity = CourseCatalogMapper.toEntity(request);
        CourseCatalog saved = service.create(entity);
        return CourseCatalogMapper.toDto(saved);
    }

    @Transactional
    public CourseCatalogResponse findById(Long id) {
        CourseCatalog entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Course catalog not found"));
        return CourseCatalogMapper.toDto(entity);
    }

    @Transactional
    public List<CourseCatalogResponse> findAll() {
        return service.findAll().stream()
                .map(CourseCatalogMapper::toDto)
                .toList();
    }

    @Transactional
    public CourseCatalogResponse update(Long id, CourseCatalogRequest request) {
        CourseCatalog entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Course catalog not found"));
        CourseCatalogMapper.updateEntity(entity, request);
        CourseCatalog updated = service.update(id, entity);
        return CourseCatalogMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<CourseCatalogResponse> search(String query) {
        return service.search(query).stream()
                .map(CourseCatalogMapper::toDto)
                .toList();
    }
}
