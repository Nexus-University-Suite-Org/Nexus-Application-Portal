package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.repository.AdmissionSchemeRepository;
import org.nexus.napbackend.repository.ProgramRepository;
import org.springframework.stereotype.Service;

@Service
public class AdmissionSchemeService {

    public static final String OPEN = "OPEN";
    public static final String SCHEDULED = "SCHEDULED";
    public static final String CLOSED = "CLOSED";

    private final AdmissionSchemeRepository repository;
    private final ProgramRepository programRepository;

    public AdmissionSchemeService(AdmissionSchemeRepository repository, ProgramRepository programRepository) {
        this.repository = repository;
        this.programRepository = programRepository;
    }

    public AdmissionScheme create(AdmissionScheme scheme) {
        return repository.save(scheme);
    }

    public java.util.Optional<AdmissionScheme> findById(Long id) {
        return repository.findById(id);
    }

    public List<AdmissionScheme> findAll() {
        return repository.findAllByOrderByAppCloseDateAsc().stream().map(this::autoExpire).toList();
    }

    public List<AdmissionScheme> findRunning() {
        return repository.findByStatusInOrderByAppCloseDateAsc(List.of(OPEN, SCHEDULED)).stream()
                .map(this::autoExpire)
                .filter(s -> OPEN.equals(s.getStatus()) || SCHEDULED.equals(s.getStatus()))
                .toList();
    }

    public List<AdmissionScheme> findRunningByProgram(Long programId) {
        return repository.findByPrograms_IdOrderByAppCloseDateAsc(programId).stream()
                .map(this::autoExpire)
                .filter(s -> OPEN.equals(s.getStatus()) || SCHEDULED.equals(s.getStatus()))
                .toList();
    }

    public AdmissionScheme update(Long id, AdmissionScheme scheme) {
        scheme.setId(id);
        return repository.save(scheme);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public Set<Program> resolvePrograms(List<Long> programIds) {
        if (programIds == null || programIds.isEmpty()) {
            return new LinkedHashSet<>();
        }
        return programRepository.findAllById(programIds).stream().collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private AdmissionScheme autoExpire(AdmissionScheme scheme) {
        if ((OPEN.equals(scheme.getStatus()) || SCHEDULED.equals(scheme.getStatus()))
                && scheme.getAppCloseDate() != null
                && scheme.getAppCloseDate().isBefore(LocalDateTime.now())) {
            scheme.setStatus(CLOSED);
        }
        return scheme;
    }
}
