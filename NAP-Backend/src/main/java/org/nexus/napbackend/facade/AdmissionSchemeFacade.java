package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Set;
import org.nexus.napbackend.dto.AdmissionSchemeRequest;
import org.nexus.napbackend.dto.AdmissionSchemeResponse;
import org.nexus.napbackend.mapper.AdmissionSchemeMapper;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.service.AdmissionSchemeService;
import org.springframework.stereotype.Component;

@Component
public class AdmissionSchemeFacade {

    private final AdmissionSchemeService service;

    public AdmissionSchemeFacade(AdmissionSchemeService service) {
        this.service = service;
    }

    @Transactional
    public AdmissionSchemeResponse create(AdmissionSchemeRequest request, String userEmail) {
        AdmissionScheme entity = new AdmissionScheme();
        AdmissionSchemeMapper.applyRequest(entity, request);
        Set<Program> programs = service.resolvePrograms(request.programIds());
        AdmissionSchemeMapper.setPrograms(entity, programs);
        entity.setCreatedBy(userEmail);
        return AdmissionSchemeMapper.toDto(service.create(entity));
    }

    @Transactional
    public AdmissionSchemeResponse findById(Long id) {
        AdmissionScheme entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Admission scheme not found"));
        return AdmissionSchemeMapper.toDto(entity);
    }

    @Transactional
    public List<AdmissionSchemeResponse> findAll() {
        return service.findAll().stream().map(AdmissionSchemeMapper::toDto).toList();
    }

    @Transactional
    public List<AdmissionSchemeResponse> findRunning() {
        return service.findRunning().stream().map(AdmissionSchemeMapper::toDto).toList();
    }

    @Transactional
    public List<AdmissionSchemeResponse> findRunningByProgram(Long programId) {
        return service.findRunningByProgram(programId).stream().map(AdmissionSchemeMapper::toDto).toList();
    }

    @Transactional
    public AdmissionSchemeResponse update(Long id, AdmissionSchemeRequest request, String userEmail) {
        AdmissionScheme entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Admission scheme not found"));
        AdmissionSchemeMapper.applyRequest(entity, request);
        Set<Program> programs = service.resolvePrograms(request.programIds());
        AdmissionSchemeMapper.mergePrograms(entity, programs);
        entity.setUpdatedBy(userEmail);
        return AdmissionSchemeMapper.toDto(service.update(id, entity));
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }
}
