package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.MessageDraft;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageDraftRepository extends JpaRepository<MessageDraft, Long> {

    List<MessageDraft> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<MessageDraft> findByIdAndUserId(Long id, Long userId);
}
