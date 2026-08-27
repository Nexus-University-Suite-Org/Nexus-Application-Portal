package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.PageSection;
import org.nexus.napbackend.repository.PageSectionRepository;
import org.springframework.stereotype.Service;

@Service
public class PageSectionService {

    private static final Long DEMO_TENANT_ID = 1L;
    private final PageSectionRepository repository;

    public PageSectionService(PageSectionRepository repository) {
        this.repository = repository;
    }

    public PageSection create(PageSection entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<PageSection> findById(Long id) {
        return repository.findById(id);
    }

    public List<PageSection> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public List<PageSection> findByPageKey(String pageKey) {
        if (pageKey == null || pageKey.isEmpty()) {
            return repository.findAllByOrderByCreatedAtDesc();
        }
        return repository.findByPageKeyOrderByCreatedAtDesc(pageKey);
    }

    public PageSection update(Long id, PageSection entity) {
        entity.setId(id);
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<PageSection> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAll().stream()
                .filter(s -> (s.getTitle() != null && s.getTitle().toLowerCase().contains(lower))
                        || (s.getSubtitle() != null && s.getSubtitle().toLowerCase().contains(lower))
                        || (s.getBody() != null && s.getBody().toLowerCase().contains(lower))
                        || (s.getSectionKey() != null && s.getSectionKey().toLowerCase().contains(lower)))
                .toList();
    }
}
