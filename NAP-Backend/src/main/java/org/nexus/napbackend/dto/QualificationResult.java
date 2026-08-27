package org.nexus.napbackend.dto;

import java.util.List;

public record QualificationResult(
        String programmeCode,
        String programmeName,
        boolean qualified,
        double totalScore,
        double cutoffScore,
        double oLevelScore,
        double aLevelScore,
        List<SubjectScore> breakdown,
        String reason
) {
    public record SubjectScore(
            String subject,
            String grade,
            String category,
            double gradePoints,
            double weight,
            double weightedPoints
    ) {}
}
