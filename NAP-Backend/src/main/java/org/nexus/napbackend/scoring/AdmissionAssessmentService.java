package org.nexus.napbackend.scoring;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.nexus.napbackend.dto.AdmissionAssessmentResponse;
import org.nexus.napbackend.model.AdmissionDecision;
import org.nexus.napbackend.repository.AdmissionDecisionRepository;
import org.nexus.napbackend.repository.ApplicationRepository;
import org.nexus.napbackend.tenancy.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdmissionAssessmentService {

    private static final TypeReference<List<CriterionScore>> CRITERIA_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<GateResult>> GATES_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<String>> REASONS_TYPE = new TypeReference<>() {};

    private final ApplicationRepository applicationRepository;
    private final AdmissionDecisionRepository decisionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AdmissionAssessmentService(ApplicationRepository applicationRepository,
                                      AdmissionDecisionRepository decisionRepository) {
        this.applicationRepository = applicationRepository;
        this.decisionRepository = decisionRepository;
    }

    @Transactional(readOnly = true)
    public List<AdmissionAssessmentResponse> getForApplication(Long applicationId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (applicationRepository.findByIdAndTenantId(applicationId, tenantId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
        }

        return decisionRepository.findByTenantIdAndApplicationIdOrderByIdAsc(tenantId, applicationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AdmissionAssessmentResponse toResponse(AdmissionDecision decision) {
        return new AdmissionAssessmentResponse(
                decision.getProgrammeCode(),
                decision.getModelRecommendation(),
                decision.getOutcome(),
                decision.getAdmissionIndex(),
                decision.getCutoffIndex(),
                decision.getOLevelIndex(),
                decision.getALevelIndex(),
                decision.getScoringMode(),
                decision.getModelVersion(),
                decision.getDataQuality(),
                readJson(decision.getCriteriaJson(), CRITERIA_TYPE, "criteria"),
                readJson(decision.getGatesJson(), GATES_TYPE, "gates"),
                readJson(decision.getReasonsJson(), REASONS_TYPE, "reasons"),
                decision.getHumanOutcome(),
                decision.getOverrodeEngine(),
                decision.getCreatedAt()
        );
    }

    private <T> List<T> readJson(String value, TypeReference<List<T>> type, String field) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(value, type);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new IllegalStateException("Stored admission assessment " + field + " is invalid JSON", e);
        }
    }
}
