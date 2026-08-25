package org.nexus.napbackend.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.nexus.napbackend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findTop100ByOrderByCreatedAtDesc();

    List<AuditLog> findByEntityOrderByCreatedAtDesc(String entity);

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<AuditLog> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    List<AuditLog> findByEntityAndUserIdOrderByCreatedAtDesc(String entity, Long userId);
}
