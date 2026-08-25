package org.nexus.napbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record MessageSendRequest(
        @NotNull Long toUserId,
        @NotBlank @Size(max = 500) String subject,
        @NotBlank @Size(max = 50000) String body,
        List<AttachmentRequest> attachments
) {
    public record AttachmentRequest(
            @NotBlank String url,
            @NotBlank @Size(max = 255) String name,
            @NotNull Long size
    ) {
    }
}
