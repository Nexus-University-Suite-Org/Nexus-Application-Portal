package org.nexus.napbackend.service;

import org.nexus.napbackend.tenancy.TenantContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.CmsEvent;
import org.nexus.napbackend.repository.CmsEventRepository;
import org.springframework.stereotype.Service;

@Service
public class CmsEventService {
    private final CmsEventRepository repository;

    public CmsEventService(CmsEventRepository repository) {
        this.repository = repository;
    }

    public CmsEvent create(CmsEvent entity) {
        entity.setTenantId(TenantContext.getCurrentTenantId());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<CmsEvent> findById(Long id) {
        return repository.findById(id);
    }

    public List<CmsEvent> findAll() {
        return repository.findAllByTenantId(TenantContext.getCurrentTenantId());
    }

    public List<CmsEvent> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return repository.findAllByTenantId(TenantContext.getCurrentTenantId()).stream()
                .filter(e -> (start == null || (e.getEventDate() != null && !e.getEventDate().isBefore(start)))
                        && (end == null || (e.getEventDate() != null && !e.getEventDate().isAfter(end))))
                .toList();
    }

    public CmsEvent update(Long id, CmsEvent entity) {
        entity.setId(id);
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<CmsEvent> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAllByTenantId(TenantContext.getCurrentTenantId()).stream()
                .filter(e -> (e.getTitle() != null && e.getTitle().toLowerCase().contains(lower))
                        || (e.getDescription() != null && e.getDescription().toLowerCase().contains(lower)))
                .toList();
    }
}
