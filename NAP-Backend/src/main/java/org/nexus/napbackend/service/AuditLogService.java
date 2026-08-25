package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import org.nexus.napbackend.model.AuditLog;
import org.nexus.napbackend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private static final Long DEMO_TENANT_ID = 1L;

    private final AuditLogRepository repository;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public AuditLog create(AuditLog entity) {
        entity.setTenantId(DEMO_TENANT_ID);
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    public List<AuditLog> findRecent(int limit) {
        return repository.findTop100ByOrderByCreatedAtDesc();
    }

    public List<AuditLog> findByEntity(String entity) {
        return repository.findByEntityOrderByCreatedAtDesc(entity);
    }

    public List<AuditLog> findByUserId(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<AuditLog> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return repository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
    }
}
