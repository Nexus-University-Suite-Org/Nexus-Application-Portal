package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Faq;
import org.nexus.napbackend.repository.FaqRepository;
import org.springframework.stereotype.Service;

@Service
public class FaqService {

    private final FaqRepository repository;

    public FaqService(FaqRepository repository) {
        this.repository = repository;
    }

    public Faq create(Faq entity) {
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<Faq> findById(Long id) {
        return repository.findById(id);
    }

    public List<Faq> findAll() {
        return repository.findAllByOrderByDisplayOrderAsc();
    }

    public List<Faq> findByCategory(String category) {
        if (category == null || category.isEmpty()) {
            return repository.findAllByOrderByDisplayOrderAsc();
        }
        return repository.findAllByOrderByDisplayOrderAsc().stream()
                .filter(f -> category.equalsIgnoreCase(f.getCategory()))
                .toList();
    }

    public Faq update(Long id, Faq entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<Faq> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAllByOrderByDisplayOrderAsc().stream()
                .filter(f -> (f.getQuestion() != null && f.getQuestion().toLowerCase().contains(lower))
                        || (f.getAnswer() != null && f.getAnswer().toLowerCase().contains(lower))
                        || (f.getCategory() != null && f.getCategory().toLowerCase().contains(lower)))
                .toList();
    }
}
