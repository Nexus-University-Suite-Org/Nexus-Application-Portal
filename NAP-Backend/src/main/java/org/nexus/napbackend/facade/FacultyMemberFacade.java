package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.FacultyMemberRequest;
import org.nexus.napbackend.dto.FacultyMemberResponse;
import org.nexus.napbackend.mapper.FacultyMemberMapper;
import org.nexus.napbackend.model.FacultyMember;
import org.nexus.napbackend.service.FacultyMemberService;
import org.springframework.stereotype.Component;

@Component
public class FacultyMemberFacade {

    private final FacultyMemberService service;

    public FacultyMemberFacade(FacultyMemberService service) {
        this.service = service;
    }

    @Transactional
    public FacultyMemberResponse create(FacultyMemberRequest request) {
        FacultyMember entity = FacultyMemberMapper.toEntity(request);
        FacultyMember saved = service.create(entity);
        return FacultyMemberMapper.toDto(saved);
    }

    @Transactional
    public FacultyMemberResponse findById(Long id) {
        FacultyMember entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty member not found"));
        return FacultyMemberMapper.toDto(entity);
    }

    @Transactional
    public List<FacultyMemberResponse> findAll() {
        return service.findAll().stream()
                .map(FacultyMemberMapper::toDto)
                .toList();
    }

    @Transactional
    public FacultyMemberResponse update(Long id, FacultyMemberRequest request) {
        FacultyMember entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty member not found"));
        FacultyMemberMapper.updateEntity(entity, request);
        FacultyMember updated = service.update(id, entity);
        return FacultyMemberMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<FacultyMemberResponse> search(String query) {
        return service.search(query).stream()
                .map(FacultyMemberMapper::toDto)
                .toList();
    }
}
