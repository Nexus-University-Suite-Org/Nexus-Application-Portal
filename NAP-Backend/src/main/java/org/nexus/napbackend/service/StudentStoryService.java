package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.StudentStory;
import org.nexus.napbackend.repository.StudentStoryRepository;
import org.springframework.stereotype.Service;

@Service
public class StudentStoryService {

    private static final Long DEMO_TENANT_ID = 1L;
    private final StudentStoryRepository repository;

    public StudentStoryService(StudentStoryRepository repository) {
        this.repository = repository;
    }

    public StudentStory create(StudentStory entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setSlug(generateSlug(entity.getTitle()));
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<StudentStory> findById(Long id) {
        return repository.findById(id);
    }

    public List<StudentStory> findAll() {
        return repository.findAll();
    }

    public StudentStory update(Long id, StudentStory entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<StudentStory> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAll().stream()
                .filter(s -> (s.getTitle() != null && s.getTitle().toLowerCase().contains(lower))
                        || (s.getContent() != null && s.getContent().toLowerCase().contains(lower))
                        || (s.getAuthor() != null && s.getAuthor().toLowerCase().contains(lower))
                        || (s.getStudentName() != null && s.getStudentName().toLowerCase().contains(lower))
                        || (s.getProgram() != null && s.getProgram().toLowerCase().contains(lower)))
                .toList();
    }

    private String generateSlug(String title) {
        if (title == null) return "";
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
