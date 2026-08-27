package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.ContactSubmissionResponse;
import org.nexus.napbackend.model.ContactSubmission;

public final class ContactSubmissionMapper {

    private ContactSubmissionMapper() {}

    public static ContactSubmissionResponse toDto(ContactSubmission entity) {
        return new ContactSubmissionResponse(
                entity.getId(),
                entity.getTenantId(),
                entity.getName(),
                entity.getEmail(),
                entity.getSubject(),
                entity.getMessage(),
                entity.getSource(),
                entity.getStatus(),
                entity.getIpAddress(),
                entity.getEmailedAt(),
                entity.getCreatedAt()
        );
    }
}
