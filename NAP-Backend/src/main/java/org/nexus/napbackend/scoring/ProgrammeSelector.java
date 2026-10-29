package org.nexus.napbackend.scoring;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Deterministic rank-and-allocate over a pool of applicants for a fixed capacity.
 *
 * <p>Exists for the case this system cannot yet measure: more qualified
 * applicants than places. That question is fully solvable without any training
 * data, which is why it is answered here rather than deferred to a model.
 *
 * <p>Only applicants the engine marked {@link AdmissionOutcome#ADMIT} are
 * eligible. Everyone else in the pool is left with their own outcome, so this
 * never converts a rejection into an offer or the reverse. Ties are broken by
 * earliest submission then lowest id, so the same pool always produces the same
 * selection and the result can be audited after the fact.
 */
@Component
public class ProgrammeSelector {

    public record Candidate(
            Long applicationId,
            double admissionIndex,
            AdmissionOutcome outcome,
            LocalDateTime submittedAt
    ) {
    }

    public record Offered(Candidate candidate, int rank) {
    }

    public record Selection(
            int capacity,
            List<Offered> offered,
            List<Offered> waitlisted,
            List<Candidate> notEligible
    ) {
        public List<Long> offeredApplicationIds() {
            return offered.stream().map(o -> o.candidate().applicationId()).toList();
        }
    }

    private static final Comparator<Candidate> RANKING = Comparator
            .comparingDouble(Candidate::admissionIndex).reversed()
            .thenComparing(Candidate::submittedAt, Comparator.nullsLast(Comparator.naturalOrder()))
            .thenComparing(Candidate::applicationId, Comparator.nullsLast(Comparator.naturalOrder()));

    public Selection select(List<Candidate> candidates, int capacity) {
        List<Candidate> eligible = candidates.stream()
                .filter(c -> c.outcome() == AdmissionOutcome.ADMIT)
                .sorted(RANKING)
                .toList();

        List<Candidate> notEligible = candidates.stream()
                .filter(c -> c.outcome() != AdmissionOutcome.ADMIT)
                .sorted(RANKING)
                .toList();

        List<Offered> offered = new ArrayList<>();
        List<Offered> waitlisted = new ArrayList<>();
        int effectiveCapacity = Math.max(0, capacity);

        for (int i = 0; i < eligible.size(); i++) {
            Candidate candidate = eligible.get(i);
            if (i < effectiveCapacity) {
                offered.add(new Offered(candidate, i + 1));
            } else {
                waitlisted.add(new Offered(candidate, i + 1));
            }
        }

        return new Selection(effectiveCapacity, List.copyOf(offered), List.copyOf(waitlisted), List.copyOf(notEligible));
    }
}
