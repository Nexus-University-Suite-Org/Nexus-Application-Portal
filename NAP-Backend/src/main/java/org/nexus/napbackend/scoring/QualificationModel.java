package org.nexus.napbackend.scoring;

/**
 * The seam a learned model will eventually occupy.
 *
 * <p>There is no training data in this system, so no model is fitted today. This
 * interface exists so that adding one later is a single implementation change
 * with no effect on callers, the persisted decision format, or the API.
 *
 * <p>Any implementation must satisfy the same contract the current one does:
 *
 * <ul>
 *   <li>It must never depend on applicant gender. A learned coefficient is not a
 *       defensible substitute for an explicit policy rule, and the explicit rule
 *       was removed from this engine for that reason.</li>
 *   <li>It must return a decomposable {@link QualificationEvaluation}. A bare
 *       probability with no per-criterion attribution is not acceptable for a
 *       decision an applicant can appeal.</li>
 *   <li>It must fail closed. Untrustworthy input yields REVIEW, never an
 *       automatic admit or reject.</li>
 * </ul>
 */
public interface QualificationModel {

    ModelVersion version();

    QualificationEvaluation evaluate(ScoringRequest request);
}
