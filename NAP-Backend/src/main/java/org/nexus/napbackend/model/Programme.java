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

@Entity
@Table(name = "programmes")
public class Programme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 200)
    private String faculty;

    @Column(name = "minimum_uce_passes")
    private int minimumUcePasses = 5;

    @Column(name = "cutoff_score", nullable = false)
    private double cutoffScore;

    @Column(name = "essential_subjects", columnDefinition = "text")
    private String essentialSubjects;

    @Column(name = "relevant_subjects", columnDefinition = "text")
    private String relevantSubjects;

    @Column(name = "desirable_subjects", columnDefinition = "text")
    private String desirableSubjects;

    @Column(name = "entry_requirements", columnDefinition = "text")
    private String entryRequirements;

    @Column(name = "is_active")
    private boolean isActive = true;

    private int capacity = 100;

    @Column(name = "intake_year", length = 10)
    private String intakeYear;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

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

    public Programme() {}

    public Programme(String code, String name, String faculty, double cutoffScore,
                     String essentialSubjects, String relevantSubjects, String desirableSubjects) {
        this.code = code;
        this.name = name;
        this.faculty = faculty;
        this.cutoffScore = cutoffScore;
        this.essentialSubjects = essentialSubjects;
        this.relevantSubjects = relevantSubjects;
        this.desirableSubjects = desirableSubjects;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public int getMinimumUcePasses() { return minimumUcePasses; }
    public void setMinimumUcePasses(int minimumUcePasses) { this.minimumUcePasses = minimumUcePasses; }
    public double getCutoffScore() { return cutoffScore; }
    public void setCutoffScore(double cutoffScore) { this.cutoffScore = cutoffScore; }
    public String getEssentialSubjects() { return essentialSubjects; }
    public void setEssentialSubjects(String essentialSubjects) { this.essentialSubjects = essentialSubjects; }
    public String getRelevantSubjects() { return relevantSubjects; }
    public void setRelevantSubjects(String relevantSubjects) { this.relevantSubjects = relevantSubjects; }
    public String getDesirableSubjects() { return desirableSubjects; }
    public void setDesirableSubjects(String desirableSubjects) { this.desirableSubjects = desirableSubjects; }
    public String getEntryRequirements() { return entryRequirements; }
    public void setEntryRequirements(String entryRequirements) { this.entryRequirements = entryRequirements; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public String getIntakeYear() { return intakeYear; }
    public void setIntakeYear(String intakeYear) { this.intakeYear = intakeYear; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
