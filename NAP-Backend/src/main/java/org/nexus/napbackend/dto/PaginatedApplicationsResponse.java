package org.nexus.napbackend.dto;

import java.util.List;

public record PaginatedApplicationsResponse(
        List<ApplicationResponse> content,
        long totalElements,
        int totalPages,
        int currentPage,
        int pageSize
) {
}
