package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.PartnerRequest;
import org.nexus.napbackend.dto.PartnerResponse;
import org.nexus.napbackend.mapper.PartnerMapper;
import org.nexus.napbackend.model.Partner;
import org.nexus.napbackend.service.PartnerService;
import org.springframework.stereotype.Component;

@Component
public class PartnerFacade {

    private final PartnerService service;

    public PartnerFacade(PartnerService service) {
        this.service = service;
    }

    @Transactional
    public PartnerResponse create(PartnerRequest request) {
        Partner entity = PartnerMapper.toEntity(request);
        Partner saved = service.create(entity);
        return PartnerMapper.toDto(saved);
    }

    @Transactional
    public PartnerResponse findById(Long id) {
        Partner entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found"));
        return PartnerMapper.toDto(entity);
    }

    @Transactional
    public List<PartnerResponse> findAll() {
        return service.findAll().stream()
                .map(PartnerMapper::toDto)
                .toList();
    }

    @Transactional
    public PartnerResponse update(Long id, PartnerRequest request) {
        Partner entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found"));
        PartnerMapper.updateEntity(entity, request);
        Partner updated = service.update(id, entity);
        return PartnerMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<PartnerResponse> search(String query) {
        return service.search(query).stream()
                .map(PartnerMapper::toDto)
                .toList();
    }
}
