package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Message;
import org.nexus.napbackend.model.MessageAttachment;
import org.nexus.napbackend.model.MessageDraft;
import org.nexus.napbackend.repository.MessageAttachmentRepository;
import org.nexus.napbackend.repository.MessageDraftRepository;
import org.nexus.napbackend.repository.MessageRepository;
import org.springframework.stereotype.Service;

@Service
public class MessageService {

    private static final Long DEMO_TENANT_ID = 1L;

    private final MessageRepository messageRepository;
    private final MessageAttachmentRepository attachmentRepository;
    private final MessageDraftRepository draftRepository;

    public MessageService(MessageRepository messageRepository,
                          MessageAttachmentRepository attachmentRepository,
                          MessageDraftRepository draftRepository) {
        this.messageRepository = messageRepository;
        this.attachmentRepository = attachmentRepository;
        this.draftRepository = draftRepository;
    }

    public Message sendMessage(Message entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        return messageRepository.save(entity);
    }

    public MessageAttachment saveAttachment(MessageAttachment attachment) {
        attachment.setCreatedAt(LocalDateTime.now());
        return attachmentRepository.save(attachment);
    }

    public Optional<Message> findById(Long id) {
        return messageRepository.findById(id);
    }

    public List<Message> findInbox(Long userId) {
        return messageRepository.findInbox(userId);
    }

    public List<Message> findSent(Long userId) {
        return messageRepository.findSent(userId);
    }

    public List<Message> findStarred(Long userId) {
        return messageRepository.findStarred(userId);
    }

    public List<MessageAttachment> findAttachments(Long messageId) {
        return attachmentRepository.findByMessageId(messageId);
    }

    public Message update(Message entity) {
        return messageRepository.save(entity);
    }

    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }

    public MessageDraft saveDraft(MessageDraft draft) {
        draft.setTenantId(DEMO_TENANT_ID);
        if (draft.getId() == null) {
            draft.setCreatedAt(LocalDateTime.now());
        }
        draft.setUpdatedAt(LocalDateTime.now());
        return draftRepository.save(draft);
    }

    public List<MessageDraft> findDrafts(Long userId) {
        return draftRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public Optional<MessageDraft> findDraftByIdAndUserId(Long id, Long userId) {
        return draftRepository.findByIdAndUserId(id, userId);
    }

    public void deleteDraft(Long id) {
        draftRepository.deleteById(id);
    }
}
