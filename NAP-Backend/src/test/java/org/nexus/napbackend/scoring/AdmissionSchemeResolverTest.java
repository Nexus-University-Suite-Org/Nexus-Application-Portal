package org.nexus.napbackend.scoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.repository.AdmissionSchemeRepository;

class AdmissionSchemeResolverTest {

    private final AdmissionSchemeRepository repository = mock(AdmissionSchemeRepository.class);
    private final AdmissionSchemeResolver resolver = new AdmissionSchemeResolver(repository);

    private static Application application(String entryScheme) {
        Application application = new Application();
        application.setId(1L);
        application.setEntryScheme(entryScheme);
        return application;
    }

    private static AdmissionScheme scheme(String name) {
        AdmissionScheme scheme = new AdmissionScheme();
        scheme.setSchemeName(name);
        return scheme;
    }

    @Test
    @DisplayName("Resolves the scheme the applicant named")
    void resolvesNamedScheme() {
        AdmissionScheme target = scheme("January 2027 Direct Entry");
        when(repository.findAll()).thenReturn(List.of(scheme("August 2026"), target));

        assertEquals(target, resolver.resolve(application("January 2027 Direct Entry")).orElseThrow());
    }

    @Test
    @DisplayName("Scheme matching ignores case and surrounding whitespace")
    void matchingIsForgiving() {
        AdmissionScheme target = scheme("January 2027 Direct Entry");
        when(repository.findAll()).thenReturn(List.of(target));

        assertTrue(resolver.resolve(application("  january 2027 direct entry ")).isPresent());
    }

    @Test
    @DisplayName("An applicant who named no scheme gets the documented defaults")
    void unnamedApplicantGetsDefaults() {
        when(repository.findAll()).thenReturn(List.of(scheme("January 2027")));

        assertTrue(resolver.resolve(application(null)).isEmpty());
        assertTrue(resolver.resolve(application("   ")).isEmpty());
    }

    @Test
    @DisplayName("An unknown scheme name falls back rather than guessing")
    void unknownSchemeFallsBack() {
        when(repository.findAll()).thenReturn(List.of(scheme("January 2027")));

        assertTrue(resolver.resolve(application("Some Scheme That Was Never Created")).isEmpty());
    }

    @Test
    @DisplayName("Duplicate scheme names are treated as a data fault, not resolved by coin toss")
    void ambiguousSchemeIsNotGuessed() {
        when(repository.findAll()).thenReturn(List.of(scheme("January 2027"), scheme("January 2027")));

        assertTrue(resolver.resolve(application("January 2027")).isEmpty(),
                "two schemes with the same name must not silently change an admission index");
    }

    @Test
    @DisplayName("A null application resolves to nothing rather than throwing")
    void nullApplicationIsSafe() {
        assertTrue(resolver.resolve(null).isEmpty());
    }
}
