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

<<<<<<< HEAD
    @Column(nullable = false, columnDefinition = "TEXT")
=======
    @Column(nullable = false, columnDefinition = "text")
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
    private String content;

    @Column(name = "student_name", length = 300)
    private String studentName;

    @Column(length = 300)
    private String author;

    @Column(length = 300)
    private String program;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(nullable = false)
    private Boolean featured;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
