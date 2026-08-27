package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.nexus.napbackend.dto.CmsEventRequest;
import org.nexus.napbackend.dto.CmsEventResponse;
import org.nexus.napbackend.mapper.CmsEventMapper;
import org.nexus.napbackend.model.CmsEvent;
import org.nexus.napbackend.service.CmsEventService;
import org.springframework.stereotype.Component;

@Component
public class CmsEventFacade {

    private final CmsEventService service;

    public CmsEventFacade(CmsEventService service) {
        this.service = service;
    }

    @Transactional
    public CmsEventResponse create(CmsEventRequest request) {
        CmsEvent entity = CmsEventMapper.toEntity(request);
        CmsEvent saved = service.create(entity);
        return CmsEventMapper.toDto(saved);
    }

    @Transactional
    public CmsEventResponse findById(Long id) {
        CmsEvent entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return CmsEventMapper.toDto(entity);
    }

    @Transactional
    public List<CmsEventResponse> findAll() {
        return service.findAll().stream()
                .map(CmsEventMapper::toDto)
                .toList();
    }

    @Transactional
    public List<CmsEventResponse> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return service.findByDateRange(start, end).stream()
                .map(CmsEventMapper::toDto)
                .toList();
    }

    @Transactional
    public CmsEventResponse update(Long id, CmsEventRequest request) {
        CmsEvent entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        CmsEventMapper.updateEntity(entity, request);
        CmsEvent updated = service.update(id, entity);
        return CmsEventMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<CmsEventResponse> search(String query) {
        return service.search(query).stream()
                .map(CmsEventMapper::toDto)
                .toList();
    }
}
