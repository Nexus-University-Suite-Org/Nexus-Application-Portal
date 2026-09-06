package org.nexus.napbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "admission_schemes")
@Getter
@Setter
public class AdmissionScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scheme_name", nullable = false, length = 300)
    private String schemeName;

    @Column(length = 50)
    private String category;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "intake_month", length = 20)
    private String intakeMonth;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "app_open_date")
    private LocalDateTime appOpenDate;

    @Column(name = "app_close_date")
    private LocalDateTime appCloseDate;

    private Integer capacity;

    @Column(name = "application_fees", columnDefinition = "text")
    private String applicationFees;

    @Column(name = "preferred_start_date", columnDefinition = "text")
    private String preferredStartDate;

    @Column(name = "service_fee")
    private BigDecimal serviceFee;

    @Column(nullable = false, length = 20)
    private String status = "CLOSED";

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "admission_scheme_programs",
            joinColumns = @JoinColumn(name = "scheme_id"),
            inverseJoinColumns = @JoinColumn(name = "program_id"))
    private Set<Program> programs = new LinkedHashSet<>();

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
