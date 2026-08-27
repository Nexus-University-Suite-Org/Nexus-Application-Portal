package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.GalleryItemRequest;
import org.nexus.napbackend.dto.GalleryItemResponse;
import org.nexus.napbackend.mapper.GalleryItemMapper;
import org.nexus.napbackend.model.GalleryItem;
import org.nexus.napbackend.service.GalleryItemService;
import org.springframework.stereotype.Component;

@Component
public class GalleryItemFacade {

    private final GalleryItemService service;

    public GalleryItemFacade(GalleryItemService service) {
        this.service = service;
    }

    @Transactional
    public GalleryItemResponse create(GalleryItemRequest request) {
        GalleryItem entity = GalleryItemMapper.toEntity(request);
        GalleryItem saved = service.create(entity);
        return GalleryItemMapper.toDto(saved);
    }

    @Transactional
    public GalleryItemResponse findById(Long id) {
        GalleryItem entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Gallery item not found"));
        return GalleryItemMapper.toDto(entity);
    }

    @Transactional
    public List<GalleryItemResponse> findAll() {
        return service.findAll().stream()
                .map(GalleryItemMapper::toDto)
                .toList();
    }

    @Transactional
    public List<GalleryItemResponse> findByCategory(String category) {
        return service.findByCategory(category).stream()
                .map(GalleryItemMapper::toDto)
                .toList();
    }

    @Transactional
    public GalleryItemResponse update(Long id, GalleryItemRequest request) {
        GalleryItem entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Gallery item not found"));
        GalleryItemMapper.updateEntity(entity, request);
        GalleryItem updated = service.update(id, entity);
        return GalleryItemMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<GalleryItemResponse> search(String query) {
        return service.search(query).stream()
                .map(GalleryItemMapper::toDto)
                .toList();
    }
}
