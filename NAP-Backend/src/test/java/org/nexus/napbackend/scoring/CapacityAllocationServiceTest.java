package org.nexus.napbackend.scoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.nexus.napbackend.model.AdmissionDecision;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.repository.AdmissionDecisionRepository;

class CapacityAllocationServiceTest {

    private final AdmissionDecisionRepository repository = mock(AdmissionDecisionRepository.class);
    private final CapacityAllocationService service =
            new CapacityAllocationService(repository, new ProgrammeSelector());

    private static final LocalDateTime T0 = LocalDateTime.of(2026, 1, 1, 9, 0);

    private static Program programme(Integer capacity) {
        Program programme = new Program();
        programme.setId(1L);
        programme.setProgramCode("ENG");
        programme.setProgramName("Engineering");
        programme.setCapacity(capacity);
        return programme;
    }

    private static AdmissionDecision decision(long id, long applicationId, double index, String outcome) {
        AdmissionDecision decision = new AdmissionDecision();
        decision.setId(id);
        decision.setApplicationId(applicationId);
        decision.setProgrammeCode("ENG");
        decision.setAdmissionIndex(index);
        decision.setOutcome(outcome);
        decision.setSubmittedAt(T0.plusMinutes(applicationId));
        return decision;
    }

    private void givenDecisions(List<AdmissionDecision> decisions) {
        when(repository.findByProgrammeCodeOrderByAdmissionIndexDesc("ENG")).thenReturn(decisions);
    }

    @Test
    @DisplayName("Offers the highest ranked applicants up to the capacity")
    void offersUpToCapacity() {
        givenDecisions(List.of(
                decision(1, 1, 90, "ADMIT"),
                decision(2, 2, 85, "ADMIT"),
                decision(3, 3, 80, "ADMIT")));

        ProgrammeSelector.Selection selection = service.allocate(programme(2));

        assertEquals(2, selection.offered().size());
        assertEquals(List.of(1L, 2L), selection.offeredApplicationIds());
        assertEquals(1, selection.waitlisted().size());
    }

    @Test
    @DisplayName("A capacity shortfall can never turn a rejection into an offer")
    void rejectionsAreNeverOffered() {
        givenDecisions(List.of(
                decision(1, 1, 99, "REJECT"),
                decision(2, 2, 98, "REVIEW"),
                decision(3, 3, 10, "ADMIT")));

        ProgrammeSelector.Selection selection = service.allocate(programme(5));

        assertEquals(List.of(3L), selection.offeredApplicationIds());
        assertEquals(2, selection.notEligible().size());
    }

    @Test
    @DisplayName("A rescore does not let one applicant occupy several places")
    void onlyTheLatestDecisionPerApplicantIsRanked() {
        givenDecisions(List.of(
                decision(1, 7, 90, "ADMIT"),
                decision(2, 8, 60, "ADMIT"),
                decision(3, 7, 40, "ADMIT")));

        ProgrammeSelector.Selection selection = service.allocate(programme(2));

        assertEquals(2, selection.offered().size() + selection.waitlisted().size(),
                "application 7 appears once, ranked on its highest-scoring decision");
        assertTrue(selection.offeredApplicationIds().contains(7L));
    }

    @Test
    @DisplayName("An unreadable stored outcome is treated as ineligible, not as permission to offer")
    void damagedOutcomeDoesNotGrantAPlace() {
        givenDecisions(List.of(
                decision(1, 1, 90, null),
                decision(2, 2, 89, "not-a-real-outcome")));

        assertTrue(service.allocate(programme(5)).offered().isEmpty());
    }

    @Test
    @DisplayName("A programme with no capacity configured offers nobody")
    void missingCapacityOffersNobody() {
        givenDecisions(List.of(decision(1, 1, 90, "ADMIT")));

        ProgrammeSelector.Selection selection = service.allocate(programme(null));

        assertEquals(0, selection.capacity());
        assertTrue(selection.offered().isEmpty());
        assertEquals(1, selection.waitlisted().size(), "still qualified, just not placed");
    }

    @Test
    @DisplayName("An unscored programme returns an empty selection rather than failing")
    void emptyPoolIsSafe() {
        givenDecisions(List.of());

        ProgrammeSelector.Selection selection = service.allocate(programme(10));

        assertTrue(selection.offered().isEmpty());
        assertTrue(selection.notEligible().isEmpty());
    }
}
