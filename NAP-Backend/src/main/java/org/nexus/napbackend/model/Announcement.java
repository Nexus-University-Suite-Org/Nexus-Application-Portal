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
@Table(name = "announcements")
@Getter
@Setter
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false)
    private String body;

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "is_system_wide", nullable = false)
    private Boolean isSystemWide;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
