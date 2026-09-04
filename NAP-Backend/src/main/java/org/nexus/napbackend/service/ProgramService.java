package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.repository.ProgramRepository;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ProgramService {

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
            if (exists == null || exists == 0) return;
            Long programCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM programs WHERE deleted_at IS NULL", Long.class);
            if (programCount != null && programCount > 0) return;
            List<java.util.Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT code, name, faculty, minimum_uce_passes, cutoff_score, essential_subjects, "
                    + "relevant_subjects, desirable_subjects, entry_requirements, is_active, capacity, intake_year "
                    + "FROM programmes");
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
        } catch (Exception ignored) {}
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
