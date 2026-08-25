package org.nexus.napbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String action,
        String entity,
        Long entityId,
        String entityName,
        String details,
        @JsonProperty("user_id") Long userId,
        @JsonProperty("user_name") String userName,
        LocalDateTime createdAt
) {
}
