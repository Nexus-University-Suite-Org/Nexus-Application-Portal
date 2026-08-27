package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Scholarship;
import org.nexus.napbackend.repository.ScholarshipRepository;
import org.springframework.stereotype.Service;

@Service
public class ScholarshipService {

    private final ScholarshipRepository repository;

    public ScholarshipService(ScholarshipRepository repository) {
        this.repository = repository;
    }

    public Scholarship create(Scholarship entity) {
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<Scholarship> findById(Long id) {
        return repository.findById(id);
    }

    public List<Scholarship> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public Scholarship update(Long id, Scholarship entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<Scholarship> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAll().stream()
                .filter(s -> (s.getTitle() != null && s.getTitle().toLowerCase().contains(lower))
                        || (s.getDescription() != null && s.getDescription().toLowerCase().contains(lower))
                        || (s.getEligibility() != null && s.getEligibility().toLowerCase().contains(lower)))
                .toList();
    }
}
