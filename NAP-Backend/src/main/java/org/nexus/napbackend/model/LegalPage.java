package org.nexus.napbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "legal_pages")
@Getter
@Setter
public class LegalPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 200)
    private String slug;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(length = 20)
    private String version;

    @Column(name = "updated_date")
    private LocalDate updatedDate;

    @Column(nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
