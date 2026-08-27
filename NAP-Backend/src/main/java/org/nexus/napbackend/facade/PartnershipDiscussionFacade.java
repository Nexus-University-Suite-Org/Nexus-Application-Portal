package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.PartnershipDiscussionResponse;
import org.nexus.napbackend.mapper.PartnershipDiscussionMapper;
import org.nexus.napbackend.model.PartnershipDiscussion;
import org.nexus.napbackend.repository.PartnershipDiscussionRepository;
import org.springframework.stereotype.Component;

@Component
public class PartnershipDiscussionFacade {

    private final PartnershipDiscussionRepository repository;

    public PartnershipDiscussionFacade(PartnershipDiscussionRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public List<PartnershipDiscussionResponse> findAll() {
        return repository.findAll().stream()
                .map(PartnershipDiscussionMapper::toDto)
                .toList();
    }

    @Transactional
    public PartnershipDiscussionResponse findById(Long id) {
        PartnershipDiscussion entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partnership discussion not found"));
        return PartnershipDiscussionMapper.toDto(entity);
    }

    @Transactional
    public PartnershipDiscussionResponse updateStatus(Long id, String status) {
        PartnershipDiscussion entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partnership discussion not found"));
        entity.setStatus(status);
        PartnershipDiscussion updated = repository.save(entity);
        return PartnershipDiscussionMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Partnership discussion not found");
        }
        repository.deleteById(id);
    }
}
