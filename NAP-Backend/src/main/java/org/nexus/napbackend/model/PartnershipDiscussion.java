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
@Table(name = "partnership_discussions")
@Getter
@Setter
public class PartnershipDiscussion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "organization_name", nullable = false, length = 200)
    private String organizationName;

    @Column(nullable = false, length = 320)
    private String contact_email;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "contact_person", length = 200)
    private String contactPerson;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
