package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.nexus.napbackend.dto.AuditLogResponse;
import org.nexus.napbackend.mapper.AuditLogMapper;
import org.nexus.napbackend.model.AuditLog;
import org.nexus.napbackend.service.AuditLogService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class AuditLogFacade {

    private final AuditLogService service;

    public AuditLogFacade(AuditLogService service) {
        this.service = service;
    }

    @Transactional
    public AuditLogResponse log(String action, String entity, Long entityId, String entityName,
                                String details, Long userId, String userName) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntity(entity);
        auditLog.setEntityId(entityId);
        auditLog.setEntityName(entityName);
        auditLog.setDetails(details);
        auditLog.setUserId(userId);
        auditLog.setUserName(userName);
        AuditLog saved = service.create(auditLog);
        return AuditLogMapper.toDto(saved);
    }

    @Transactional
    public List<AuditLogResponse> list(int limit, String entity, Long userId,
                                        LocalDateTime startDate, LocalDateTime endDate) {
        List<AuditLog> logs;
        if (entity != null && userId != null) {
            logs = service.findByEntity(entity);
        } else if (entity != null) {
            logs = service.findByEntity(entity);
        } else if (userId != null) {
            logs = service.findByUserId(userId);
        } else if (startDate != null && endDate != null) {
            logs = service.findByDateRange(startDate, endDate);
        } else {
            logs = service.findRecent(limit);
        }
        return logs.stream()
                .map(AuditLogMapper::toDto)
                .toList();
    }
}
