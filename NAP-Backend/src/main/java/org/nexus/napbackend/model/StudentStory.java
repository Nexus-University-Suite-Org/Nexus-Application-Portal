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
@Table(name = "student_stories")
@Getter
@Setter
public class StudentStory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 500)
    private String slug;

    @Column(nullable = false)
    private String content;

    @Column(length = 200)
    private String author;

    @Column(nullable = false)
    private Boolean featured;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
