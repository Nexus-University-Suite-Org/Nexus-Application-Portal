package org.nexus.napbackend.scoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ProgrammeSelectorTest {

    private static final LocalDateTime T0 = LocalDateTime.of(2026, 1, 1, 9, 0);

    private final ProgrammeSelector selector = new ProgrammeSelector();

    private ProgrammeSelector.Candidate candidate(long id, double index, AdmissionOutcome outcome, int minuteOffset) {
        return new ProgrammeSelector.Candidate(id, index, outcome, T0.plusMinutes(minuteOffset));
    }

    @Test
    @DisplayName("Never offers more places than the capacity")
    void neverExceedsCapacity() {
        List<ProgrammeSelector.Candidate> pool = List.of(
                candidate(1, 90, AdmissionOutcome.ADMIT, 0),
                candidate(2, 85, AdmissionOutcome.ADMIT, 1),
                candidate(3, 80, AdmissionOutcome.ADMIT, 2),
                candidate(4, 75, AdmissionOutcome.ADMIT, 3));

        ProgrammeSelector.Selection selection = selector.select(pool, 2);

        assertEquals(2, selection.offered().size());
        assertEquals(2, selection.waitlisted().size());
        assertEquals(List.of(1L, 2L), selection.offeredApplicationIds());
    }

    @Test
    @DisplayName("Ranks by index, highest first")
    void ranksByIndexDescending() {
        List<ProgrammeSelector.Candidate> pool = List.of(
                candidate(1, 60, AdmissionOutcome.ADMIT, 0),
                candidate(2, 95, AdmissionOutcome.ADMIT, 1),
                candidate(3, 77, AdmissionOutcome.ADMIT, 2));

        ProgrammeSelector.Selection selection = selector.select(pool, 1);

        assertEquals(1, selection.offered().size());
        assertEquals(2L, selection.offered().get(0).candidate().applicationId());
        assertEquals(1, selection.offered().get(0).rank());
    }

    @Test
    @DisplayName("Ties are broken by earliest submission, then lowest id")
    void tiesAreDeterministic() {
        List<ProgrammeSelector.Candidate> pool = List.of(
                candidate(7, 80, AdmissionOutcome.ADMIT, 5),
                candidate(3, 80, AdmissionOutcome.ADMIT, 1),
                candidate(5, 80, AdmissionOutcome.ADMIT, 1));

        ProgrammeSelector.Selection first = selector.select(pool, 1);
        ProgrammeSelector.Selection second = selector.select(pool.reversed(), 1);

        assertEquals(List.of(3L), first.offeredApplicationIds(),
                "same submission time, so lowest id wins");
        assertEquals(first.offeredApplicationIds(), second.offeredApplicationIds(),
                "selection must not depend on the order the pool is supplied in");
    }

    @Test
    @DisplayName("Only applicants the engine admitted are eligible for an offer")
    void nonAdmittedAreNeverOffered() {
        List<ProgrammeSelector.Candidate> pool = List.of(
                candidate(1, 99, AdmissionOutcome.REVIEW, 0),
                candidate(2, 98, AdmissionOutcome.REJECT, 1),
                candidate(3, 10, AdmissionOutcome.ADMIT, 2));

        ProgrammeSelector.Selection selection = selector.select(pool, 5);

        assertEquals(List.of(3L), selection.offeredApplicationIds(),
                "a high-scoring applicant needing review must not be auto-offered a place");
        assertEquals(2, selection.notEligible().size());
    }

    @Test
    @DisplayName("A zero or negative capacity offers nothing")
    void zeroCapacityOffersNothing() {
        List<ProgrammeSelector.Candidate> pool = List.of(
                candidate(1, 90, AdmissionOutcome.ADMIT, 0),
                candidate(2, 85, AdmissionOutcome.ADMIT, 1));

        assertTrue(selector.select(pool, 0).offered().isEmpty());
        assertTrue(selector.select(pool, -5).offered().isEmpty());
        assertEquals(2, selector.select(pool, 0).waitlisted().size());
    }

    @Test
    @DisplayName("Overflow becomes waitlist, never rejection")
    void overflowIsWaitlistedNotRejected() {
        List<ProgrammeSelector.Candidate> pool = List.of(
                candidate(1, 90, AdmissionOutcome.ADMIT, 0),
                candidate(2, 88, AdmissionOutcome.ADMIT, 1),
                candidate(3, 86, AdmissionOutcome.ADMIT, 2));

        ProgrammeSelector.Selection selection = selector.select(pool, 1);

        assertEquals(List.of(2L, 3L), selection.waitlisted().stream()
                .map(o -> o.candidate().applicationId()).toList());
        assertTrue(selection.notEligible().isEmpty());
    }
}
