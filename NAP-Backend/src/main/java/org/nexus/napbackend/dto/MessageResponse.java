package org.nexus.napbackend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record MessageResponse(
        Long id,
        Long fromUserId,
        Long toUserId,
        String subject,
        String body,
        Boolean senderDeleted,
        Boolean recipientDeleted,
        Boolean senderStarred,
        Boolean recipientStarred,
        Boolean senderArchived,
        Boolean recipientArchived,
        LocalDateTime readAt,
        LocalDateTime createdAt,
        List<AttachmentResponse> attachments
) {
    public record AttachmentResponse(Long id, String url, String name, Long size) {
    }
}
