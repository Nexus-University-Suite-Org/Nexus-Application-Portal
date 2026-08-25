package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.AuditLogResponse;
import org.nexus.napbackend.model.AuditLog;

public final class AuditLogMapper {

    private AuditLogMapper() {
    }

    public static AuditLogResponse toDto(AuditLog entity) {
        return new AuditLogResponse(
                entity.getId(),
                entity.getAction(),
                entity.getEntity(),
                entity.getEntityId(),
                entity.getEntityName(),
                entity.getDetails(),
                entity.getUserId(),
                entity.getUserName(),
                entity.getCreatedAt()
        );
    }
}
