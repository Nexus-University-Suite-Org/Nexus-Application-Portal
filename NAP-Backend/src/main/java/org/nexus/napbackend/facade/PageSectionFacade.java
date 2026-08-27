package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.PageSectionRequest;
import org.nexus.napbackend.dto.PageSectionResponse;
import org.nexus.napbackend.mapper.PageSectionMapper;
import org.nexus.napbackend.model.PageSection;
import org.nexus.napbackend.service.PageSectionService;
import org.springframework.stereotype.Component;

@Component
public class PageSectionFacade {

    private final PageSectionService service;

    public PageSectionFacade(PageSectionService service) {
        this.service = service;
    }

    @Transactional
    public PageSectionResponse create(PageSectionRequest request) {
        PageSection entity = PageSectionMapper.toEntity(request);
        PageSection saved = service.create(entity);
        return PageSectionMapper.toDto(saved);
    }

    @Transactional
    public PageSectionResponse findById(Long id) {
        PageSection entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Page section not found"));
        return PageSectionMapper.toDto(entity);
    }

    @Transactional
    public List<PageSectionResponse> findAll() {
        return service.findAll().stream()
                .map(PageSectionMapper::toDto)
                .toList();
    }

    @Transactional
    public List<PageSectionResponse> findByPageKey(String pageKey) {
        return service.findByPageKey(pageKey).stream()
                .map(PageSectionMapper::toDto)
                .toList();
    }

    @Transactional
    public PageSectionResponse update(Long id, PageSectionRequest request) {
        PageSection entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Page section not found"));
        PageSectionMapper.updateEntity(entity, request);
        PageSection updated = service.update(id, entity);
        return PageSectionMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<PageSectionResponse> search(String query) {
        return service.search(query).stream()
                .map(PageSectionMapper::toDto)
                .toList();
    }
}
