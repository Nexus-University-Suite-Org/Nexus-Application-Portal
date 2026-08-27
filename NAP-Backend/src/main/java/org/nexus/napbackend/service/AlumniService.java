package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Alumni;
import org.nexus.napbackend.repository.AlumniRepository;
import org.springframework.stereotype.Service;

@Service
public class AlumniService {

    private final AlumniRepository repository;

    public AlumniService(AlumniRepository repository) {
        this.repository = repository;
    }

    public Alumni create(Alumni entity) {
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<Alumni> findById(Long id) {
        return repository.findById(id);
    }

    public List<Alumni> findAll() {
        return repository.findAll();
    }

    public Alumni update(Long id, Alumni entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<Alumni> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAll().stream()
                .filter(a -> (a.getName() != null && a.getName().toLowerCase().contains(lower))
                        || (a.getProgram() != null && a.getProgram().toLowerCase().contains(lower))
                        || (a.getBio() != null && a.getBio().toLowerCase().contains(lower)))
                .toList();
    }
}
