package org.nexus.napbackend.dto;

import java.util.List;

/**
 * The outcome of running a programme's capacity over its scored pool.
 *
 * <p>Exposed so an admissions officer can see the whole picture at once: who was
 * offered a place, who is waiting, and which applicants were never eligible. The
 * not-eligible group matters as much as the offered one, because an applicant
 * absent from both lists has been silently dropped and would otherwise go
 * unnoticed.
 *
 * @param programmeCode     programme the run was for
 * @param capacity          places available
 * @param offeredCount      applicants given a place
 * @param waitlistedCount   qualified applicants who missed out
 * @param notEligibleCount  applicants who did not meet the standard
 * @param offers            ranked offers, highest admission index first
 * @param waitlist          ranked overflow, in the same order
 */
public record SelectionResponse(
        String programmeCode,
        int capacity,
        int offeredCount,
        int waitlistedCount,
        int notEligibleCount,
        List<RankedApplicant> offers,
        List<RankedApplicant> waitlist
) {

    /**
     * @param rank            1-based position in the programme's ranking
     * @param applicationId   applicant
     * @param admissionIndex  0-100 index the rank was derived from
     * @param outcome         the engine outcome that made the applicant eligible
     */
    public record RankedApplicant(
            int rank,
            Long applicationId,
            double admissionIndex,
            String outcome
    ) {}
}
