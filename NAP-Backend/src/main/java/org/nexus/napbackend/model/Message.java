package org.nexus.napbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "messages")
@Getter
@Setter
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "from_user_id", nullable = false)
    private Long fromUserId;

    @Column(name = "to_user_id", nullable = false)
    private Long toUserId;

    @Column(nullable = false, length = 500)
    private String subject;

    @Column(nullable = false)
    private String body;

    @Column(name = "sender_deleted", nullable = false)
    private Boolean senderDeleted;

    @Column(name = "recipient_deleted", nullable = false)
    private Boolean recipientDeleted;

    @Column(name = "sender_starred", nullable = false)
    private Boolean senderStarred;

    @Column(name = "recipient_starred", nullable = false)
    private Boolean recipientStarred;

    @Column(name = "sender_archived", nullable = false)
    private Boolean senderArchived;

    @Column(name = "recipient_archived", nullable = false)
    private Boolean recipientArchived;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
