package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.QuickLink;
import org.nexus.napbackend.repository.QuickLinkRepository;
import org.springframework.stereotype.Service;

@Service
public class QuickLinkService {

    private static final Long DEMO_TENANT_ID = 1L;
    private final QuickLinkRepository repository;

    public QuickLinkService(QuickLinkRepository repository) {
        this.repository = repository;
    }

    public QuickLink create(QuickLink entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<QuickLink> findById(Long id) {
        return repository.findById(id);
    }

    public List<QuickLink> findAll() {
        return repository.findAllByOrderByDisplayOrderAsc();
    }

    public QuickLink update(Long id, QuickLink entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<QuickLink> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAll().stream()
                .filter(l -> (l.getTitle() != null && l.getTitle().toLowerCase().contains(lower))
                        || (l.getUrl() != null && l.getUrl().toLowerCase().contains(lower)))
                .toList();
    }
}
