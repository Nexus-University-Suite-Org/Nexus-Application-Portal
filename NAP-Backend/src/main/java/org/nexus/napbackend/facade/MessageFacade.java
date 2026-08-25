package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.nexus.napbackend.dto.MessageDraftRequest;
import org.nexus.napbackend.dto.MessageDraftResponse;
import org.nexus.napbackend.dto.MessageResponse;
import org.nexus.napbackend.dto.MessageSendRequest;
import org.nexus.napbackend.mapper.MessageMapper;
import org.nexus.napbackend.model.Message;
import org.nexus.napbackend.model.MessageAttachment;
import org.nexus.napbackend.model.MessageDraft;
import org.nexus.napbackend.service.MessageService;

@Facade
public class MessageFacade {

    private final MessageService service;

    public MessageFacade(MessageService service) {
        this.service = service;
    }

    @Transactional
    public MessageResponse send(MessageSendRequest request, Long fromUserId) {
        Message entity = MessageMapper.toEntity(request, fromUserId);
        Message saved = service.sendMessage(entity);
        if (request.attachments() != null) {
            for (MessageSendRequest.AttachmentRequest att : request.attachments()) {
                MessageAttachment attachment = MessageMapper.toAttachmentEntity(att, saved.getId());
                service.saveAttachment(attachment);
            }
        }
        List<MessageAttachment> attachments = service.findAttachments(saved.getId());
        return MessageMapper.toDto(saved, attachments, fromUserId);
    }

    @Transactional
    public List<MessageResponse> getInbox(Long userId) {
        return service.findInbox(userId).stream()
                .map(m -> MessageMapper.toDto(m, service.findAttachments(m.getId()), userId))
                .toList();
    }

    @Transactional
    public List<MessageResponse> getSent(Long userId) {
        return service.findSent(userId).stream()
                .map(m -> MessageMapper.toDto(m, service.findAttachments(m.getId()), userId))
                .toList();
    }

    @Transactional
    public List<MessageResponse> getStarred(Long userId) {
        return service.findStarred(userId).stream()
                .map(m -> MessageMapper.toDto(m, service.findAttachments(m.getId()), userId))
                .toList();
    }

    @Transactional
    public MessageResponse getById(Long id, Long userId) {
        Message message = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
        List<MessageAttachment> attachments = service.findAttachments(id);
        return MessageMapper.toDto(message, attachments, userId);
    }

    @Transactional
    public MessageResponse markRead(Long id, Long userId) {
        Message message = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
        if (message.getReadAt() == null) {
            message.setReadAt(LocalDateTime.now());
            service.update(message);
        }
        List<MessageAttachment> attachments = service.findAttachments(id);
        return MessageMapper.toDto(message, attachments, userId);
    }

    @Transactional
    public void softDelete(Long id, Long userId) {
        Message message = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
        if (message.getFromUserId().equals(userId)) {
            message.setSenderDeleted(true);
        }
        if (message.getToUserId().equals(userId)) {
            message.setRecipientDeleted(true);
        }
        service.update(message);
    }

    @Transactional
    public void toggleStar(Long id, Long userId) {
        Message message = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
        if (message.getFromUserId().equals(userId)) {
            message.setSenderStarred(!message.getSenderStarred());
        }
        if (message.getToUserId().equals(userId)) {
            message.setRecipientStarred(!message.getRecipientStarred());
        }
        service.update(message);
    }

    @Transactional
    public void toggleArchive(Long id, Long userId) {
        Message message = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
        if (message.getFromUserId().equals(userId)) {
            message.setSenderArchived(!message.getSenderArchived());
        }
        if (message.getToUserId().equals(userId)) {
            message.setRecipientArchived(!message.getRecipientArchived());
        }
        service.update(message);
    }

    @Transactional
    public MessageDraftResponse saveDraft(MessageDraftRequest request, Long userId) {
        MessageDraft draft = MessageMapper.toDraftEntity(request, userId);
        MessageDraft saved = service.saveDraft(draft);
        return MessageMapper.toDraftDto(saved);
    }

    @Transactional
    public List<MessageDraftResponse> getDrafts(Long userId) {
        return service.findDrafts(userId).stream()
                .map(MessageMapper::toDraftDto)
                .toList();
    }

    @Transactional
    public MessageDraftResponse getDraftById(Long id, Long userId) {
        MessageDraft draft = service.findDraftByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));
        return MessageMapper.toDraftDto(draft);
    }

    @Transactional
    public void deleteDraft(Long id, Long userId) {
        service.findDraftByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));
        service.deleteDraft(id);
    }
}
