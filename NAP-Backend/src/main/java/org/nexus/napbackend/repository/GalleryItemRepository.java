package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.GalleryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GalleryItemRepository extends JpaRepository<GalleryItem, Long> {

    List<GalleryItem> findAllByOrderByCreatedAtDesc();
}
