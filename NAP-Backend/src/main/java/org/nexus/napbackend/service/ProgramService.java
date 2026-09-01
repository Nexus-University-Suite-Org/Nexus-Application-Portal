package org.nexus.napbackend.service;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.repository.ProgramRepository;
import org.springframework.stereotype.Service;

@Service
public class ProgramService {

    private final ProgramRepository repository;

    public ProgramService(ProgramRepository repository) {
        this.repository = repository;
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
