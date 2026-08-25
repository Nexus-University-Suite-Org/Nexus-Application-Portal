package org.nexus.napbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long userId,
        String type,
        String title,
        String message,
        Long relatedId,
        String link,
        @JsonProperty("read") Boolean read,
        LocalDateTime createdAt
) {
}
