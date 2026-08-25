package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long> {

    List<MessageAttachment> findByMessageId(Long messageId);
}
