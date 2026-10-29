package org.nexus.napbackend.scoring;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.repository.AdmissionSchemeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Works out which admission scheme an applicant applied under.
 *
 * <p>Scheme selection was never implemented: the application records a free-text
 * {@code entry_scheme} string, and the scoring code read nothing, so every
 * applicant was silently scored under the hard-coded defaults regardless of what
 * they applied to. That is not safe to leave in place once scheme weights become
 * configurable, because a scheme's weights would apply to nobody.
 *
 * <p>The resolution is deliberately conservative. An applicant's free-text entry
 * is matched against scheme names case-insensitively, and if more than one scheme
 * matches, this returns nothing rather than guessing. Falling back to the
 * documented defaults is auditable; picking a random one of two competing schemes
 * is not, and it would change an applicant's admission index with no record of
 * why.
 */
@Component
public class AdmissionSchemeResolver {

    private static final Logger log = LoggerFactory.getLogger(AdmissionSchemeResolver.class);

    private final AdmissionSchemeRepository schemeRepository;

    public AdmissionSchemeResolver(AdmissionSchemeRepository schemeRepository) {
        this.schemeRepository = schemeRepository;
    }

    /**
     * @return the matching scheme, or empty when the applicant named none, named
     *         something unknown, or named something ambiguous. Empty is not an
     *         error: {@link ScoringPolicyFactory} then applies documented defaults.
     */
    @Transactional(readOnly = true)
    public Optional<AdmissionScheme> resolve(Application application) {
        if (application == null) {
            return Optional.empty();
        }
        String declared = application.getEntryScheme();
        if (declared == null || declared.isBlank()) {
            return Optional.empty();
        }
        String wanted = declared.trim();

        List<AdmissionScheme> matches = schemeRepository.findAll().stream()
                .filter(scheme -> scheme.getSchemeName() != null)
                .filter(scheme -> scheme.getSchemeName().trim().equalsIgnoreCase(wanted))
                .toList();

        if (matches.isEmpty()) {
            log.warn("Application {} named admission scheme '{}' which matches no scheme; "
                            + "falling back to the default scoring policy",
                    application.getId(), wanted);
            return Optional.empty();
        }
        if (matches.size() > 1) {
            // Duplicate scheme names are a data-entry fault. Do not pick one.
            log.error("Application {} named admission scheme '{}' which matches {} schemes; "
                            + "refusing to guess and falling back to the default scoring policy",
                    application.getId(), wanted, matches.size());
            return Optional.empty();
        }
        return Optional.of(matches.get(0));
    }

    /**
     * Ranking used by callers that must pick one of several candidate schemes,
     * such as a cohort-wide capacity run. Exposed separately so the
     * "ambiguous means no answer" rule in {@link #resolve} is not accidentally
     * reused where a deterministic order is genuinely wanted.
     */
    public static Comparator<AdmissionScheme> mostRecentlyClosingFirst() {
        return Comparator.comparing(
                AdmissionScheme::getAppCloseDate,
                Comparator.nullsLast(Comparator.reverseOrder()));
    }
}
