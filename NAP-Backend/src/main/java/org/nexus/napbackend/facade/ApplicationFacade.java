package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.nexus.napbackend.dto.ApplicationCreateRequest;
import org.nexus.napbackend.dto.ApplicationResponse;
import org.nexus.napbackend.mapper.ApplicationMapper;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.service.ApplicationService;

@Facade
public class ApplicationFacade {

    private final ApplicationService service;

    public ApplicationFacade(ApplicationService service) {
        this.service = service;
    }

    @Transactional
    public ApplicationResponse create(ApplicationCreateRequest request) {
        Application entity = ApplicationMapper.toEntity(request);
        entity.setPrn(generatePrn());
        Application saved = service.create(entity);
        return ApplicationMapper.toDto(saved);
    }

    @Transactional
    public ApplicationResponse submit(Long id) {
        Application entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        if (!entity.getEmailVerified()) {
            throw new RuntimeException("Email must be verified before submission");
        }
        entity.setStatus("SUBMITTED");
        entity.setSubmittedAt(LocalDateTime.now());
        Application updated = service.update(entity);
        return ApplicationMapper.toDto(updated);
    }

    @Transactional
    public ApplicationResponse review(Long id, String reviewStatus, String notes) {
        Application entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        if (!"SUBMITTED".equals(entity.getStatus())) {
            throw new RuntimeException("Only SUBMITTED applications can be reviewed. Current status: " + entity.getStatus());
        }
        entity.setReviewStatus(reviewStatus.toUpperCase());
        entity.setReviewerNotes(notes);
        entity.setReviewedAt(LocalDateTime.now());
        if ("admitted".equals(reviewStatus)) {
            entity.setStatus("ADMITTED");
        } else if ("rejected".equals(reviewStatus)) {
            entity.setStatus("REJECTED");
        } else if ("waitlisted".equals(reviewStatus)) {
            entity.setStatus("WAITLISTED");
        }
        Application updated = service.update(entity);
        return ApplicationMapper.toDto(updated);
    }

    @Transactional
    public ApplicationResponse findById(Long id) {
        Application entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        return ApplicationMapper.toDto(entity);
    }

    @Transactional
    public List<ApplicationResponse> findAll() {
        return service.findAll().stream()
                .map(ApplicationMapper::toDto)
                .toList();
    }

    @Transactional
    public List<ApplicationResponse> findByEmail(String email) {
        return service.findByEmail(email).stream()
                .map(ApplicationMapper::toDto)
                .toList();
    }

    @Transactional
    public List<ApplicationResponse> findByStatus(String status) {
        return service.findByStatus(status).stream()
                .map(ApplicationMapper::toDto)
                .toList();
    }

    @Transactional
    public List<ApplicationResponse> findByReviewStatus(String reviewStatus) {
        return service.findByReviewStatus(reviewStatus).stream()
                .map(ApplicationMapper::toDto)
                .toList();
    }

    @Transactional
    public void delete(Long id) {
        service.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        service.deleteById(id);
    }

    private String generatePrn() {
        return "PRN-" + System.currentTimeMillis();
    }
}
