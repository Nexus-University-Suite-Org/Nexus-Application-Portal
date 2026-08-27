package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.AlumniRequest;
import org.nexus.napbackend.dto.AlumniResponse;
import org.nexus.napbackend.mapper.AlumniMapper;
import org.nexus.napbackend.model.Alumni;
import org.nexus.napbackend.service.AlumniService;
import org.springframework.stereotype.Component;

@Component
public class AlumniFacade {

    private final AlumniService service;

    public AlumniFacade(AlumniService service) {
        this.service = service;
    }

    @Transactional
    public AlumniResponse create(AlumniRequest request) {
        Alumni entity = AlumniMapper.toEntity(request);
        Alumni saved = service.create(entity);
        return AlumniMapper.toDto(saved);
    }

    @Transactional
    public AlumniResponse findById(Long id) {
        Alumni entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));
        return AlumniMapper.toDto(entity);
    }

    @Transactional
    public List<AlumniResponse> findAll() {
        return service.findAll().stream()
                .map(AlumniMapper::toDto)
                .toList();
    }

    @Transactional
    public AlumniResponse update(Long id, AlumniRequest request) {
        Alumni entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Alumni not found"));
        AlumniMapper.updateEntity(entity, request);
        Alumni updated = service.update(id, entity);
        return AlumniMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<AlumniResponse> search(String query) {
        return service.search(query).stream()
                .map(AlumniMapper::toDto)
                .toList();
    }
}
