package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.repository.ApplicationRepository;
import org.springframework.stereotype.Service;

@Service
public class ApplicationService {

    private static final Long DEMO_TENANT_ID = 1L;

    private final ApplicationRepository repository;

    public ApplicationService(ApplicationRepository repository) {
        this.repository = repository;
    }

    public Application create(Application entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Application update(Application entity) {
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public Optional<Application> findById(Long id) {
        return repository.findById(id);
    }

    public Optional<Application> findByPrn(String prn) {
        return repository.findByPrn(prn);
    }

    public List<Application> findAll() {
        return repository.findAll();
    }

    public List<Application> findByEmail(String email) {
        return repository.findByEmailOrderByCreatedAtDesc(email);
    }

    public List<Application> findByStatus(String status) {
        return repository.findByStatusOrderByCreatedAtDesc(status);
    }

    public List<Application> findByReviewStatus(String reviewStatus) {
        return repository.findByReviewStatusOrderByCreatedAtDesc(reviewStatus);
    }

    public boolean existsByPrn(String prn) {
        return repository.existsByPrn(prn);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
