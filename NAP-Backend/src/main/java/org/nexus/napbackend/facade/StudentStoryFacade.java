package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.StudentStoryRequest;
import org.nexus.napbackend.dto.StudentStoryResponse;
import org.nexus.napbackend.mapper.StudentStoryMapper;
import org.nexus.napbackend.model.StudentStory;
import org.nexus.napbackend.service.StudentStoryService;
import org.springframework.stereotype.Component;

@Component
public class StudentStoryFacade {

    private final StudentStoryService service;

    public StudentStoryFacade(StudentStoryService service) {
        this.service = service;
    }

    @Transactional
    public StudentStoryResponse create(StudentStoryRequest request) {
        StudentStory entity = StudentStoryMapper.toEntity(request);
        StudentStory saved = service.create(entity);
        return StudentStoryMapper.toDto(saved);
    }

    @Transactional
    public StudentStoryResponse findById(Long id) {
        StudentStory entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Student story not found"));
        return StudentStoryMapper.toDto(entity);
    }

    @Transactional
    public List<StudentStoryResponse> findAll() {
        return service.findAll().stream()
                .map(StudentStoryMapper::toDto)
                .toList();
    }

    @Transactional
    public StudentStoryResponse update(Long id, StudentStoryRequest request) {
        StudentStory entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Student story not found"));
        StudentStoryMapper.updateEntity(entity, request);
        StudentStory updated = service.update(id, entity);
        return StudentStoryMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<StudentStoryResponse> search(String query) {
        return service.search(query).stream()
                .map(StudentStoryMapper::toDto)
                .toList();
    }
}
