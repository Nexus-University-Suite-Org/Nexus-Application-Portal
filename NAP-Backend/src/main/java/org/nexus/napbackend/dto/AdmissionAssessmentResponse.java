package org.nexus.napbackend.dto;

import java.time.LocalDateTime;
import java.util.List;
import org.nexus.napbackend.scoring.CriterionScore;
import org.nexus.napbackend.scoring.GateResult;

public record AdmissionAssessmentResponse(
        String programmeCode,
        String modelRecommendation,
        String decisionOfRecord,
        Double admissionIndex,
        Double cutoffIndex,
        Double oLevelIndex,
        Double aLevelIndex,
        String scoringMode,
        String modelVersion,
        String dataQuality,
        List<CriterionScore> criteria,
        List<GateResult> gates,
        List<String> reasons,
        String humanOutcome,
        Boolean overrodeEngine,
        LocalDateTime evaluatedAt
) {
}
