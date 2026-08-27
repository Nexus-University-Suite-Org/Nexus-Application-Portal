package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.LegalPageRequest;
import org.nexus.napbackend.dto.LegalPageResponse;
import org.nexus.napbackend.mapper.LegalPageMapper;
import org.nexus.napbackend.model.LegalPage;
import org.nexus.napbackend.service.LegalPageService;
import org.springframework.stereotype.Component;

@Component
public class LegalPageFacade {

    private final LegalPageService service;

    public LegalPageFacade(LegalPageService service) {
        this.service = service;
    }

    @Transactional
    public LegalPageResponse create(LegalPageRequest request) {
        LegalPage entity = LegalPageMapper.toEntity(request);
        LegalPage saved = service.create(entity);
        return LegalPageMapper.toDto(saved);
    }

    @Transactional
    public LegalPageResponse findById(Long id) {
        LegalPage entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Legal page not found"));
        return LegalPageMapper.toDto(entity);
    }

    @Transactional
    public List<LegalPageResponse> findAll() {
        return service.findAll().stream()
                .map(LegalPageMapper::toDto)
                .toList();
    }

    @Transactional
    public List<LegalPageResponse> findByType(String type) {
        return service.findByType(type).stream()
                .map(LegalPageMapper::toDto)
                .toList();
    }

    @Transactional
    public LegalPageResponse update(Long id, LegalPageRequest request) {
        LegalPage entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Legal page not found"));
        LegalPageMapper.updateEntity(entity, request);
        LegalPage updated = service.update(id, entity);
        return LegalPageMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<LegalPageResponse> search(String query) {
        return service.search(query).stream()
                .map(LegalPageMapper::toDto)
                .toList();
    }
}
