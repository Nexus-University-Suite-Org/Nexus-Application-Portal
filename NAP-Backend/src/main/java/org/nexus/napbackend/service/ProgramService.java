package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.repository.ProgramRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ProgramService {

    private static final Logger log = LoggerFactory.getLogger(ProgramService.class);

    private final ProgramRepository repository;
    private final JdbcTemplate jdbcTemplate;

    public ProgramService(ProgramRepository repository, JdbcTemplate jdbcTemplate) {
        this.repository = repository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void migrateProgrammesIntoPrograms() {
        try {
            Long exists = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'programmes'",
                    Long.class);
            if (exists == null || exists == 0) {
                log.warn("[PROGRAM-MIGRATION] Legacy table 'programmes' not found — nothing to migrate. "
                        + "The programs table will stay empty and /api/v1/programs will return an empty list.");
                return;
            }
            Long programCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM programs WHERE deleted_at IS NULL", Long.class);
            if (programCount != null && programCount > 0) {
                log.info("[PROGRAM-MIGRATION] Skipped — programs already holds {} active row(s).", programCount);
                return;
            }
            List<java.util.Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT code, name, faculty, minimum_uce_passes, cutoff_score, essential_subjects, "
                    + "relevant_subjects, desirable_subjects, entry_requirements, is_active, capacity, intake_year "
                    + "FROM programmes");
            log.info("[PROGRAM-MIGRATION] Legacy 'programmes' table has {} row(s); migrating into programs.", rows.size());
            for (java.util.Map<String, Object> row : rows) {
                Program p = new Program();
                p.setProgramName((String) row.get("name"));
                p.setProgramCode((String) row.get("code"));
                p.setFacultySchool((String) row.get("faculty"));
                p.setStatus(Boolean.TRUE.equals(row.get("is_active")) ? "Active" : "Inactive");
                Object cutoff = row.get("cutoff_score");
                p.setCutoffScore(cutoff != null ? ((Number) cutoff).doubleValue() : 0.0);
                Object passes = row.get("minimum_uce_passes");
                p.setMinimumUcePasses(passes != null ? ((Number) passes).intValue() : 5);
                Object cap = row.get("capacity");
                p.setCapacity(cap != null ? ((Number) cap).intValue() : 100);
                p.setEssentialSubjects((String) row.get("essential_subjects"));
                p.setRelevantSubjects((String) row.get("relevant_subjects"));
                p.setDesirableSubjects((String) row.get("desirable_subjects"));
                p.setAdmissionRequirements((String) row.get("entry_requirements"));
                p.setIntakeYear((String) row.get("intake_year"));
                p.setCreatedBy("system:migration");
                p.setCreatedAt(LocalDateTime.now());
                p.setUpdatedAt(LocalDateTime.now());
                repository.save(p);
            }
            log.info("[PROGRAM-MIGRATION] Completed — migrated {} program(s) into programs.", rows.size());
        } catch (Exception e) {
            log.error("[PROGRAM-MIGRATION] FAILED — programs could not be populated from 'programmes'. "
                    + "/api/v1/programs will return an empty list until this is resolved.", e);
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void normalizeProgramTypes() {
        try {
            List<Program> programs = repository.findAll();
            java.util.Set<String> canonical = java.util.Set.of("BACHELOR", "DIPLOMA", "CERTIFICATE", "MASTER", "PHD");
            for (Program p : programs) {
                String type = p.getProgramType();
                String trimmed = type == null ? "" : type.trim();
                String upper = trimmed.toUpperCase(java.util.Locale.ROOT);
                if (canonical.contains(upper)) {
                    if (!upper.equals(trimmed)) {
                        p.setProgramType(upper);
                        repository.save(p);
                    }
                } else if (trimmed.isEmpty() || "UNDERGRADUATE".equals(upper)) {
                    String normalized = inferAwardType(p.getProgramName(), p.getProgramCode());
                    if (normalized != null) {
                        p.setProgramType(normalized);
                        repository.save(p);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[PROGRAM-NORMALIZE] Could not normalize program types: {}", e.getMessage());
            log.debug("[PROGRAM-NORMALIZE] Full detail", e);
        }
    }

    public static String inferAwardType(String name, String code) {
        String n = name == null ? "" : name.toLowerCase();
        String c = code == null ? "" : code.toUpperCase();
        if (n.startsWith("doctor of") || n.contains("ph.d") || n.contains("phd") || n.contains("doctorate")) {
            return "PHD";
        }
        if (n.startsWith("master") || n.contains(" masters ") || n.contains("master of") || c.startsWith("MSC") || c.startsWith("MA-")) {
            return "MASTER";
        }
        if (n.startsWith("certificate") || n.contains("certificate in") || c.startsWith("CERT")) {
            return "CERTIFICATE";
        }
        if (n.startsWith("diploma") || c.startsWith("DIP")) {
            return "DIPLOMA";
        }
        return "BACHELOR";
    }

    public Program create(Program entity) {
        return repository.save(entity);
    }

    public Optional<Program> findById(Long id) {
        return repository.findByIdAndDeletedAtIsNull(id);
    }

    public List<Program> findAll() {
        return repository.findByDeletedAtIsNullOrderByDisplayOrderAscProgramNameAsc();
    }

    public List<Program> search(String query) {
        return repository.search(query);
    }

    public List<Program> findByStatus(String status) {
        return repository.findByDeletedAtIsNullAndStatusOrderByProgramNameAsc(status);
    }

    public List<Program> findByType(String type) {
        return repository.findByDeletedAtIsNullAndProgramTypeOrderByProgramNameAsc(type);
    }

    public Program update(Long id, Program entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    public void softDelete(Long id) {
        repository.findById(id).ifPresent(p -> {
            p.setDeletedAt(java.time.LocalDateTime.now());
            repository.save(p);
        });
    }

    public boolean existsByCode(String code) {
        return repository.existsByProgramCodeAndDeletedAtIsNull(code);
    }
}
