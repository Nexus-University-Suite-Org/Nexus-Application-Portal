package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.toUserId = :userId AND m.recipientDeleted = false ORDER BY m.createdAt DESC")
    List<Message> findInbox(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.fromUserId = :userId AND m.senderDeleted = false ORDER BY m.createdAt DESC")
    List<Message> findSent(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.toUserId = :userId AND m.recipientStarred = true AND m.recipientDeleted = false ORDER BY m.createdAt DESC")
    List<Message> findStarred(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE (m.fromUserId = :userId AND m.senderDeleted = false) OR (m.toUserId = :userId AND m.recipientDeleted = false) ORDER BY m.createdAt DESC")
    List<Message> findAllForUser(@Param("userId") Long userId);

    Optional<Message> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT m FROM Message m WHERE m.tenantId = :tenantId AND m.toUserId = :userId AND m.recipientDeleted = false ORDER BY m.createdAt DESC")
    List<Message> findInboxForTenant(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.tenantId = :tenantId AND m.fromUserId = :userId AND m.senderDeleted = false ORDER BY m.createdAt DESC")
    List<Message> findSentForTenant(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.tenantId = :tenantId AND m.toUserId = :userId AND m.recipientStarred = true AND m.recipientDeleted = false ORDER BY m.createdAt DESC")
    List<Message> findStarredForTenant(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.tenantId = :tenantId AND ((m.fromUserId = :userId AND m.senderDeleted = false) OR (m.toUserId = :userId AND m.recipientDeleted = false)) ORDER BY m.createdAt DESC")
    List<Message> findAllForUserForTenant(@Param("tenantId") Long tenantId, @Param("userId") Long userId);
}
