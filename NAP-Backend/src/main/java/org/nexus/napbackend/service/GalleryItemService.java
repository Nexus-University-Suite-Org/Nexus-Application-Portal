package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.GalleryItem;
import org.nexus.napbackend.repository.GalleryItemRepository;
import org.springframework.stereotype.Service;

@Service
public class GalleryItemService {

    private static final Long DEMO_TENANT_ID = 1L;
    private final GalleryItemRepository repository;

    public GalleryItemService(GalleryItemRepository repository) {
        this.repository = repository;
    }

    public GalleryItem create(GalleryItem entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<GalleryItem> findById(Long id) {
        return repository.findById(id);
    }

    public List<GalleryItem> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public List<GalleryItem> findByCategory(String category) {
        if (category == null || category.isEmpty()) {
            return repository.findAllByOrderByCreatedAtDesc();
        }
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .filter(item -> category.equalsIgnoreCase(item.getCategory()))
                .toList();
    }

    public GalleryItem update(Long id, GalleryItem entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<GalleryItem> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .filter(item -> (item.getSrc() != null && item.getSrc().toLowerCase().contains(lower))
                        || (item.getAlt() != null && item.getAlt().toLowerCase().contains(lower))
                        || (item.getCaption() != null && item.getCaption().toLowerCase().contains(lower)))
                .toList();
    }
}
