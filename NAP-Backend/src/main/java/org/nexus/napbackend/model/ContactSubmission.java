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
@Table(name = "contact_submissions")
@Getter
@Setter
public class ContactSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(nullable = false, length = 500)
    private String subject;

    @Column(nullable = false, length = 10000)
    private String message;

    @Column(nullable = false, length = 64)
    private String source;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "emailed_at")
    private LocalDateTime emailedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
