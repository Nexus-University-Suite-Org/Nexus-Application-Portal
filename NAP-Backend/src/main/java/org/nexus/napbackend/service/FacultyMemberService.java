package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.FacultyMember;
import org.nexus.napbackend.repository.FacultyMemberRepository;
import org.springframework.stereotype.Service;

@Service
public class FacultyMemberService {

    private static final Long DEMO_TENANT_ID = 1L;
    private final FacultyMemberRepository repository;

    public FacultyMemberService(FacultyMemberRepository repository) {
        this.repository = repository;
    }

    public FacultyMember create(FacultyMember entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<FacultyMember> findById(Long id) {
        return repository.findById(id);
    }

    public List<FacultyMember> findAll() {
        return repository.findAllByOrderByDisplayOrderAsc();
    }

    public FacultyMember update(Long id, FacultyMember entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<FacultyMember> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAll().stream()
                .filter(f -> (f.getName() != null && f.getName().toLowerCase().contains(lower))
                        || (f.getTitle() != null && f.getTitle().toLowerCase().contains(lower))
                        || (f.getDepartment() != null && f.getDepartment().toLowerCase().contains(lower))
                        || (f.getBio() != null && f.getBio().toLowerCase().contains(lower))
                        || (f.getEmail() != null && f.getEmail().toLowerCase().contains(lower))
                        || (f.getSpecialization() != null && f.getSpecialization().toLowerCase().contains(lower)))
                .toList();
    }
}
