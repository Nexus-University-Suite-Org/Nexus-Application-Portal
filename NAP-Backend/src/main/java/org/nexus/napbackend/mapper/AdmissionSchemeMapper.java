package org.nexus.napbackend.mapper;

import java.util.LinkedHashSet;
import org.nexus.napbackend.dto.AdmissionSchemeRequest;
import org.nexus.napbackend.dto.AdmissionSchemeResponse;
import org.nexus.napbackend.dto.AdmissionSchemeResponse.ProgramSummary;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.model.Program;

public final class AdmissionSchemeMapper {

    private AdmissionSchemeMapper() {}

    public static void applyRequest(AdmissionScheme entity, AdmissionSchemeRequest request) {
        entity.setSchemeName(request.schemeName());
        entity.setCategory(request.category());
        entity.setAcademicYear(request.academicYear());
        entity.setIntakeMonth(request.intakeMonth());
        entity.setDescription(request.description());
        entity.setAppOpenDate(request.appOpenDate());
        entity.setAppCloseDate(request.appCloseDate());
        entity.setCapacity(request.capacity());
        entity.setApplicationFees(request.applicationFees());
        entity.setPreferredStartDate(request.preferredStartDate());
        entity.setServiceFee(request.serviceFee());
        entity.setStatus(request.status() != null ? request.status() : "CLOSED");
    }

    public static AdmissionSchemeResponse toDto(AdmissionScheme entity) {
        var programs = entity.getPrograms() == null
                ? java.util.Collections.<ProgramSummary>emptyList()
                : entity.getPrograms().stream()
                        .map(p -> new ProgramSummary(
                                p.getId(),
                                p.getProgramName(),
                                p.getProgramCode(),
                                p.getProgramType()))
                        .toList();
        Long daysLeft = null;
        if (entity.getAppCloseDate() != null) {
            daysLeft = java.time.Duration.between(
                            java.time.LocalDateTime.now(), entity.getAppCloseDate())
                    .toDays();
        }
        return new AdmissionSchemeResponse(
                entity.getId(),
                entity.getSchemeName(),
                entity.getCategory(),
                entity.getAcademicYear(),
                entity.getIntakeMonth(),
                entity.getDescription(),
                entity.getAppOpenDate(),
                entity.getAppCloseDate(),
                entity.getCapacity(),
                entity.getApplicationFees(),
                entity.getPreferredStartDate(),
                entity.getServiceFee(),
                entity.getStatus(),
                daysLeft,
                programs.size(),
                programs,
                entity.getCreatedBy(),
                entity.getCreatedAt(),
                entity.getUpdatedBy(),
                entity.getUpdatedAt());
    }

    public static void setPrograms(AdmissionScheme entity, java.util.Set<Program> programs) {
        entity.setPrograms(programs == null ? new LinkedHashSet<>() : programs);
    }

    public static void mergePrograms(AdmissionScheme entity, java.util.Set<Program> programs) {
        if (entity.getPrograms() == null) {
            entity.setPrograms(new LinkedHashSet<>());
        }
        entity.getPrograms().clear();
        if (programs != null) {
            entity.getPrograms().addAll(programs);
        }
    }
}
