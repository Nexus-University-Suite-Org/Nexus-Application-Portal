package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.CourseCatalog;
import org.nexus.napbackend.repository.CourseCatalogRepository;
import org.springframework.stereotype.Service;

@Service
public class CourseCatalogService {

    private static final Long DEMO_TENANT_ID = 1L;
    private final CourseCatalogRepository repository;

    public CourseCatalogService(CourseCatalogRepository repository) {
        this.repository = repository;
    }

    public CourseCatalog create(CourseCatalog entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<CourseCatalog> findById(Long id) {
        return repository.findById(id);
    }

    public List<CourseCatalog> findAll() {
        return repository.findAll();
    }

    public CourseCatalog update(Long id, CourseCatalog entity) {
        entity.setId(id);
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<CourseCatalog> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAll().stream()
                .filter(c -> (c.getName() != null && c.getName().toLowerCase().contains(lower))
                        || (c.getCode() != null && c.getCode().toLowerCase().contains(lower))
                        || (c.getCollege() != null && c.getCollege().toLowerCase().contains(lower)))
                .toList();
    }
}
