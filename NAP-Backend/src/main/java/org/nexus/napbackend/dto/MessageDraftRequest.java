package org.nexus.napbackend.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record MessageDraftRequest(
        Long toUserId,
        @Size(max = 500) String subject,
        @Size(max = 50000) String body
) {
}
