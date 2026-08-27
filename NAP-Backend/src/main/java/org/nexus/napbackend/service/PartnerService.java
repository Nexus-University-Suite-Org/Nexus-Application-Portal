package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Partner;
import org.nexus.napbackend.repository.PartnerRepository;
import org.springframework.stereotype.Service;

@Service
public class PartnerService {

    private final PartnerRepository repository;

    public PartnerService(PartnerRepository repository) {
        this.repository = repository;
    }

    public Partner create(Partner entity) {
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<Partner> findById(Long id) {
        return repository.findById(id);
    }

    public List<Partner> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public Partner update(Long id, Partner entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<Partner> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAll().stream()
                .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(lower))
                        || (p.getDescription() != null && p.getDescription().toLowerCase().contains(lower)))
                .toList();
    }
}
