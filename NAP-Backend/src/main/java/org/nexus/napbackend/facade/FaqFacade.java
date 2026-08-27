package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.FaqRequest;
import org.nexus.napbackend.dto.FaqResponse;
import org.nexus.napbackend.mapper.FaqMapper;
import org.nexus.napbackend.model.Faq;
import org.nexus.napbackend.service.FaqService;
import org.springframework.stereotype.Component;

@Component
public class FaqFacade {

    private final FaqService service;

    public FaqFacade(FaqService service) {
        this.service = service;
    }

    @Transactional
    public FaqResponse create(FaqRequest request) {
        Faq entity = FaqMapper.toEntity(request);
        Faq saved = service.create(entity);
        return FaqMapper.toDto(saved);
    }

    @Transactional
    public FaqResponse findById(Long id) {
        Faq entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("FAQ not found"));
        return FaqMapper.toDto(entity);
    }

    @Transactional
    public List<FaqResponse> findAll() {
        return service.findAll().stream()
                .map(FaqMapper::toDto)
                .toList();
    }

    @Transactional
    public List<FaqResponse> findByCategory(String category) {
        return service.findByCategory(category).stream()
                .map(FaqMapper::toDto)
                .toList();
    }

    @Transactional
    public FaqResponse update(Long id, FaqRequest request) {
        Faq entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("FAQ not found"));
        FaqMapper.updateEntity(entity, request);
        Faq updated = service.update(id, entity);
        return FaqMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<FaqResponse> search(String query) {
        return service.search(query).stream()
                .map(FaqMapper::toDto)
                .toList();
    }
}
