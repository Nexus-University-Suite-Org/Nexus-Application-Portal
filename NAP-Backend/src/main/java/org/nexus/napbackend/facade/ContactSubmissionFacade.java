package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.ContactSubmissionResponse;
import org.nexus.napbackend.mapper.ContactSubmissionMapper;
import org.nexus.napbackend.model.ContactSubmission;
import org.nexus.napbackend.repository.ContactSubmissionRepository;
import org.springframework.stereotype.Component;

@Component
public class ContactSubmissionFacade {

    private final ContactSubmissionRepository repository;

    public ContactSubmissionFacade(ContactSubmissionRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public List<ContactSubmissionResponse> findAll() {
        return repository.findAll().stream()
                .map(ContactSubmissionMapper::toDto)
                .toList();
    }

    @Transactional
    public ContactSubmissionResponse findById(Long id) {
        ContactSubmission entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact submission not found"));
        return ContactSubmissionMapper.toDto(entity);
    }

    @Transactional
    public ContactSubmissionResponse updateStatus(Long id, String status) {
        ContactSubmission entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact submission not found"));
        entity.setStatus(status);
        ContactSubmission updated = repository.save(entity);
        return ContactSubmissionMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Contact submission not found");
        }
        repository.deleteById(id);
    }
}
