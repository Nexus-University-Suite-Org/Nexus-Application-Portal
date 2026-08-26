package org.nexus.napbackend.dto;

import java.util.Map;

public record DashboardStatsResponse(
        long totalApplications,
        long pendingReview,
        long admitted,
        long rejected,
        long waitlisted,
        long draft,
        Map<String, Long> monthlyTrend
) {
}
