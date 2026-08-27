package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.QuickLinkRequest;
import org.nexus.napbackend.dto.QuickLinkResponse;
import org.nexus.napbackend.mapper.QuickLinkMapper;
import org.nexus.napbackend.model.QuickLink;
import org.nexus.napbackend.service.QuickLinkService;
import org.springframework.stereotype.Component;

@Component
public class QuickLinkFacade {

    private final QuickLinkService service;

    public QuickLinkFacade(QuickLinkService service) {
        this.service = service;
    }

    @Transactional
    public QuickLinkResponse create(QuickLinkRequest request) {
        QuickLink entity = QuickLinkMapper.toEntity(request);
        QuickLink saved = service.create(entity);
        return QuickLinkMapper.toDto(saved);
    }

    @Transactional
    public QuickLinkResponse findById(Long id) {
        QuickLink entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Quick link not found"));
        return QuickLinkMapper.toDto(entity);
    }

    @Transactional
    public List<QuickLinkResponse> findAll() {
        return service.findAll().stream()
                .map(QuickLinkMapper::toDto)
                .toList();
    }

    @Transactional
    public QuickLinkResponse update(Long id, QuickLinkRequest request) {
        QuickLink entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Quick link not found"));
        QuickLinkMapper.updateEntity(entity, request);
        QuickLink updated = service.update(id, entity);
        return QuickLinkMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<QuickLinkResponse> search(String query) {
        return service.search(query).stream()
                .map(QuickLinkMapper::toDto)
                .toList();
    }
}
