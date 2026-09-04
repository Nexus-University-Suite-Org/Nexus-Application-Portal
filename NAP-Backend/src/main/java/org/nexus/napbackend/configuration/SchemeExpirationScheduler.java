package org.nexus.napbackend.configuration;

import java.time.LocalDateTime;
import java.util.List;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.repository.AdmissionSchemeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SchemeExpirationScheduler {

    private static final Logger log = LoggerFactory.getLogger(SchemeExpirationScheduler.class);

    private final AdmissionSchemeRepository repository;

    public SchemeExpirationScheduler(AdmissionSchemeRepository repository) {
        this.repository = repository;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void closeExpiredSchemes() {
        List<AdmissionScheme> expired = repository
                .findByStatusInOrderByAppCloseDateAsc(List.of("OPEN", "SCHEDULED"))
                .stream()
                .filter(s -> s.getAppCloseDate() != null && s.getAppCloseDate().isBefore(LocalDateTime.now()))
                .toList();

        for (AdmissionScheme scheme : expired) {
            scheme.setStatus("CLOSED");
            repository.save(scheme);
            log.info("Auto-closed scheme: {} (id={})", scheme.getSchemeName(), scheme.getId());
        }
    }
}
