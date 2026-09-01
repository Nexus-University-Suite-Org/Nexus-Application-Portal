package org.nexus.napbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "programs")
@Getter
@Setter
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "program_name", nullable = false, length = 300)
    private String programName;

    @Column(name = "program_code", unique = true, length = 50)
    private String programCode;

    @Column(name = "program_type", length = 50)
    private String programType;

    @Column(name = "award_qualification", length = 200)
    private String awardQualification;

    @Column(name = "program_description", columnDefinition = "text")
    private String programDescription;

    @Column(name = "program_objectives", columnDefinition = "text")
    private String programObjectives;

    @Column(name = "learning_outcomes", columnDefinition = "text")
    private String learningOutcomes;

    @Column(name = "career_opportunities", columnDefinition = "text")
    private String careerOpportunities;

    @Column(nullable = false, length = 20)
    private String status = "Active";

    @Column(name = "faculty_school", length = 200)
    private String facultySchool;

    @Column(length = 200)
    private String department;

    @Column(name = "program_coordinator", length = 200)
    private String programCoordinator;

    @Column(length = 200)
    private String campus;

    private Integer duration;

    @Column(name = "duration_unit", length = 20)
    private String durationUnit;

    @Column(name = "number_of_years")
    private Integer numberOfYears;

    @Column(name = "number_of_semesters")
    private Integer numberOfSemesters;

    @Column(name = "semesters_per_year")
    private Integer semestersPerYear;

    @Column(name = "total_credit_units")
    private Integer totalCreditUnits;

    @Column(name = "study_mode", length = 50)
    private String studyMode;

    @Column(name = "academic_calendar", length = 50)
    private String academicCalendar;

    @Column(columnDefinition = "jsonb")
    private String fees;

    @Column(name = "admission_requirements", columnDefinition = "jsonb")
    private String admissionRequirements;

    @Column(columnDefinition = "jsonb")
    private String curriculum;

    @Column(columnDefinition = "jsonb")
    private String intakes;

    @Column(name = "study_options", columnDefinition = "jsonb")
    private String studyOptions;

    @Column(columnDefinition = "jsonb")
    private String accreditation;

    @Column(columnDefinition = "jsonb")
    private String documents;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "short_description", columnDefinition = "text")
    private String shortDescription;

    @Column(name = "full_description", columnDefinition = "text")
    private String fullDescription;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

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
