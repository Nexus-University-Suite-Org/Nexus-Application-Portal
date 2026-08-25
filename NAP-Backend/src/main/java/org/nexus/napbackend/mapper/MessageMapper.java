package org.nexus.napbackend.mapper;

import java.util.Collections;
import java.util.List;
import org.nexus.napbackend.dto.MessageDraftRequest;
import org.nexus.napbackend.dto.MessageDraftResponse;
import org.nexus.napbackend.dto.MessageResponse;
import org.nexus.napbackend.dto.MessageSendRequest;
import org.nexus.napbackend.model.Message;
import org.nexus.napbackend.model.MessageAttachment;
import org.nexus.napbackend.model.MessageDraft;

public final class MessageMapper {

    private MessageMapper() {
    }

    public static Message toEntity(MessageSendRequest request, Long fromUserId) {
        Message entity = new Message();
        entity.setFromUserId(fromUserId);
        entity.setToUserId(request.toUserId());
        entity.setSubject(request.subject());
        entity.setBody(request.body());
        entity.setSenderDeleted(false);
        entity.setRecipientDeleted(false);
        entity.setSenderStarred(false);
        entity.setRecipientStarred(false);
        entity.setSenderArchived(false);
        entity.setRecipientArchived(false);
        return entity;
    }

    public static MessageResponse toDto(Message entity, List<MessageAttachment> attachments, Long viewerId) {
        List<MessageResponse.AttachmentResponse> attachmentResponses = attachments != null
                ? attachments.stream()
                        .map(a -> new MessageResponse.AttachmentResponse(a.getId(), a.getUrl(), a.getName(), a.getSize()))
                        .toList()
                : Collections.emptyList();
        return new MessageResponse(
                entity.getId(),
                entity.getFromUserId(),
                entity.getToUserId(),
                entity.getSubject(),
                entity.getBody(),
                entity.getSenderDeleted(),
                entity.getRecipientDeleted(),
                entity.getSenderStarred(),
                entity.getRecipientStarred(),
                entity.getSenderArchived(),
                entity.getRecipientArchived(),
                entity.getReadAt(),
                entity.getCreatedAt(),
                attachmentResponses
        );
    }

    public static MessageAttachment toAttachmentEntity(MessageSendRequest.AttachmentRequest request, Long messageId) {
        MessageAttachment entity = new MessageAttachment();
        entity.setMessageId(messageId);
        entity.setUrl(request.url());
        entity.setName(request.name());
        entity.setSize(request.size());
        return entity;
    }

    public static MessageDraft toDraftEntity(MessageDraftRequest request, Long userId) {
        MessageDraft entity = new MessageDraft();
        entity.setUserId(userId);
        entity.setToUserId(request.toUserId());
        entity.setSubject(request.subject() != null ? request.subject() : "(no subject)");
        entity.setBody(request.body());
        return entity;
    }

    public static MessageDraftResponse toDraftDto(MessageDraft entity) {
        return new MessageDraftResponse(
                entity.getId(),
                entity.getUserId(),
                entity.getToUserId(),
                entity.getSubject(),
                entity.getBody(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
