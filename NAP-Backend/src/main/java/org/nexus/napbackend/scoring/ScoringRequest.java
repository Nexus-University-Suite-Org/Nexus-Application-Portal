package org.nexus.napbackend.scoring;

import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;

/**
 * Everything one evaluation needs, bundled so the
 * {@link QualificationModel} signature stays stable as inputs are added.
 *
 * @param application  the applicant
 * @param programme    the programme being evaluated against
 * @param policy       resolved weights and thresholds
 * @param cutoffIndex  pass mark on the 0-100 admission index, or null when the
 *                     programme has none configured, in which case the outcome
 *                     is REVIEW rather than an automatic admit
 */
public record ScoringRequest(
        Application application,
        Program programme,
        ScoringPolicy policy,
        Double cutoffIndex
) {
}
