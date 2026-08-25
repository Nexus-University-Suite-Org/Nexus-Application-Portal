package org.nexus.napbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "gallery_items")
@Getter
@Setter
public class GalleryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false, length = 500)
    private String src;

    @Column(length = 255)
    private String alt;

    @Column(length = 500)
    private String caption;

    @Column(length = 100)
    private String category;

    @Column(nullable = false)
    private Integer span;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
