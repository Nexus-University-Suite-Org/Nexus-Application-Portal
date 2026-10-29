package org.nexus.napbackend.scoring;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.nexus.napbackend.model.AdmissionDecision;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.repository.AdmissionDecisionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Applies a programme's capacity to the pool of applicants the engine has already
 * marked admissible.
 *
 * <p>Qualification answers "does this applicant meet the standard?". Capacity
 * answers a different question: "there are more qualified applicants than
 * places, who gets them?". The second is fully solvable without training data,
 * so it is solved deterministically rather than left to an officer working
 * through a list by hand.
 *
 * <p>Only decisions whose stored outcome is {@link AdmissionOutcome#ADMIT} are
 * offered a place. Everyone else keeps the outcome they already had. That
 * direction matters: a capacity shortfall must never be able to turn a rejection
 * into an offer, and it must never quietly convert a review into a rejection
 * either.
 *
 * <p>Over capacity, the surplus applicants are returned as waitlisted rather than
 * rejected, so the officer can release a place if a ranked applicant declines.
 */
@Service
public class CapacityAllocationService {

    private final AdmissionDecisionRepository decisionRepository;
    private final ProgrammeSelector selector;

    public CapacityAllocationService(AdmissionDecisionRepository decisionRepository,
                                     ProgrammeSelector selector) {
        this.decisionRepository = decisionRepository;
        this.selector = selector;
    }

    /**
     * Ranks every scored applicant for a programme and splits them into offered
     * and waitlisted against the programme's capacity.
     *
     * <p>Only the most recent decision per application is considered. An applicant
     * can have several rows for one programme, because decisions are append-only
     * and the application may have been rescored; ranking the historical rows
     * would inflate the pool and let one applicant occupy several places.
     */
    @Transactional(readOnly = true)
    public ProgrammeSelector.Selection allocate(Program programme) {
        List<AdmissionDecision> latestPerApplication = decisionRepository
                .findByProgrammeCodeOrderByAdmissionIndexDesc(programme.getProgramCode()).stream()
                .filter(decision -> decision.getApplicationId() != null)
                .collect(java.util.stream.Collectors.toMap(
                        AdmissionDecision::getApplicationId,
                        decision -> decision,
                        (first, later) -> first))
                .values().stream()
                .sorted(Comparator.comparing(AdmissionDecision::getId,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        List<ProgrammeSelector.Candidate> candidates = latestPerApplication.stream()
                .map(decision -> new ProgrammeSelector.Candidate(
                        decision.getApplicationId(),
                        decision.getAdmissionIndex(),
                        parseOutcome(decision.getOutcome()),
                        decision.getSubmittedAt()))
                .toList();

        return selector.select(candidates, capacityOf(programme));
    }

    /**
     * An unparseable stored outcome is treated as ineligible rather than admitted.
     * Reading damaged data as permission to offer somebody a place is the wrong
     * direction to fail.
     */
    private static AdmissionOutcome parseOutcome(String raw) {
        if (raw == null) {
            return AdmissionOutcome.REVIEW;
        }
        try {
            return AdmissionOutcome.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return AdmissionOutcome.REVIEW;
        }
    }

    private static int capacityOf(Program programme) {
        Integer capacity = programme.getCapacity();
        return capacity == null ? 0 : capacity;
    }
}
