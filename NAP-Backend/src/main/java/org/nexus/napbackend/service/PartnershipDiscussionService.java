package org.nexus.napbackend.service;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import org.nexus.napbackend.dto.PartnershipDiscussionRequest;
import org.nexus.napbackend.dto.PartnershipDiscussionResponse;
import org.nexus.napbackend.model.PartnershipDiscussion;
import org.nexus.napbackend.repository.PartnershipDiscussionRepository;
import org.springframework.stereotype.Service;

@Service
public class PartnershipDiscussionService {

    private static final Long DEMO_TENANT_ID = 1L;

    private final PartnershipDiscussionRepository repository;

    public PartnershipDiscussionService(PartnershipDiscussionRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public PartnershipDiscussionResponse submit(PartnershipDiscussionRequest request, String ipAddress) {
        PartnershipDiscussion entity = new PartnershipDiscussion();
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setOrganizationName(request.organization_name());
        entity.setContact_email(request.contact_email());
        entity.setContactPhone(request.contact_phone());
        entity.setContactPerson(request.contact_person());
        entity.setMessage(request.message());
        entity.setStatus("NEW");
        entity.setIpAddress(ipAddress);
        entity.setCreatedAt(LocalDateTime.now());
        repository.save(entity);
        return new PartnershipDiscussionResponse(entity.getId(), false);
    }
}
