package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.LegalPage;
import org.nexus.napbackend.repository.LegalPageRepository;
import org.springframework.stereotype.Service;

@Service
public class LegalPageService {

    private final LegalPageRepository repository;

    public LegalPageService(LegalPageRepository repository) {
        this.repository = repository;
    }

    public LegalPage create(LegalPage entity) {
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<LegalPage> findById(Long id) {
        return repository.findById(id);
    }

    public List<LegalPage> findAll() {
        return repository.findAll();
    }

    public List<LegalPage> findByType(String type) {
        if (type == null || type.isEmpty()) {
            return repository.findAllByOrderByCreatedAtDesc();
        }
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .filter(p -> type.equalsIgnoreCase(p.getType()))
                .toList();
    }

    public LegalPage update(Long id, LegalPage entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<LegalPage> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .filter(p -> (p.getTitle() != null && p.getTitle().toLowerCase().contains(lower))
                        || (p.getType() != null && p.getType().toLowerCase().contains(lower))
                        || (p.getContent() != null && p.getContent().toLowerCase().contains(lower)))
                .toList();
    }
}
