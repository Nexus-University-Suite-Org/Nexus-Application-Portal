package org.nexus.napbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * Append-only record of one admission evaluation.
 *
 * <p>This table exists because the previous implementation only persisted a score
 * for admitted applicants. A rejected applicant's score was never stored, so it
 * could not be reviewed, appealed or used as a calibration set, and the reason
 * string shown to them was the only artefact that existed.
 *
 * <p>Rows are written for every outcome, in every scoring mode, including shadow
 * runs where the decision that actually stood came from the legacy rule engine.
 * That is what makes a later learned model possible: it needs a record of what
 * the model would have said next to what actually happened.
 */
@Entity
@Table(name = "admission_decisions")
@Getter
@Setter
public class AdmissionDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "programme_code", length = 200)
    private String programmeCode;

    @Column(name = "programme_id")
    private Long programmeId;

    @Column(name = "outcome", nullable = false, length = 20)
    private String outcome;

    @Column(name = "admission_index")
    private Double admissionIndex;

    @Column(name = "o_level_index")
    private Double oLevelIndex;

    @Column(name = "a_level_index")
    private Double aLevelIndex;

    @Column(name = "cutoff_index")
    private Double cutoffIndex;

    @Column(name = "legacy_total_score")
    private Double legacyTotalScore;

    @Column(name = "criteria_json", columnDefinition = "text")
    private String criteriaJson;

    @Column(name = "gates_json", columnDefinition = "text")
    private String gatesJson;

    @Column(name = "data_quality", length = 200)
    private String dataQuality;

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(name = "scoring_mode", length = 20)
    private String scoringMode;

    /**
     * The applicant's submission time, copied onto the decision.
     *
     * <p>Capacity ranking breaks ties on earliest submission, so this has to be
     * stored rather than read back from {@code applications}. If it were joined at
     * ranking time, editing the application would silently reorder a cohort
     * against a different rule than the one that originally allocated the places.
     */
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    /** Outcome a human officer actually recorded, when it differs from the engine's. */
    @Column(name = "human_outcome", length = 20)
    private String humanOutcome;

    @Column(name = "overrode_engine")
    private Boolean overrodeEngine = Boolean.FALSE;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
