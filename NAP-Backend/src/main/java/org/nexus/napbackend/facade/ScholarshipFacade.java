package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.ScholarshipRequest;
import org.nexus.napbackend.dto.ScholarshipResponse;
import org.nexus.napbackend.mapper.ScholarshipMapper;
import org.nexus.napbackend.model.Scholarship;
import org.nexus.napbackend.service.ScholarshipService;
import org.springframework.stereotype.Component;

@Component
public class ScholarshipFacade {

    private final ScholarshipService service;

    public ScholarshipFacade(ScholarshipService service) {
        this.service = service;
    }

    @Transactional
    public ScholarshipResponse create(ScholarshipRequest request) {
        Scholarship entity = ScholarshipMapper.toEntity(request);
        Scholarship saved = service.create(entity);
        return ScholarshipMapper.toDto(saved);
    }

    @Transactional
    public ScholarshipResponse findById(Long id) {
        Scholarship entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Scholarship not found"));
        return ScholarshipMapper.toDto(entity);
    }

    @Transactional
    public List<ScholarshipResponse> findAll() {
        return service.findAll().stream()
                .map(ScholarshipMapper::toDto)
                .toList();
    }

    @Transactional
    public ScholarshipResponse update(Long id, ScholarshipRequest request) {
        Scholarship entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Scholarship not found"));
        ScholarshipMapper.updateEntity(entity, request);
        Scholarship updated = service.update(id, entity);
        return ScholarshipMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<ScholarshipResponse> search(String query) {
        return service.search(query).stream()
                .map(ScholarshipMapper::toDto)
                .toList();
    }
}
