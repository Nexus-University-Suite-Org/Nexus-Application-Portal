package org.nexus.napbackend.mapper;

import java.util.List;
import org.nexus.napbackend.dto.ProgramRequest;
import org.nexus.napbackend.dto.ProgramResponse;
import org.nexus.napbackend.model.Program;

public final class ProgramMapper {

    private ProgramMapper() {}

    public static Program toEntity(ProgramRequest request) {
        Program entity = new Program();
        entity.setProgramName(request.programName());
        entity.setProgramCode(request.programCode());
        entity.setProgramType(request.programType());
        entity.setAwardQualification(request.awardQualification());
        entity.setProgramDescription(request.programDescription());
        entity.setProgramObjectives(request.programObjectives());
        entity.setLearningOutcomes(request.learningOutcomes());
        entity.setCareerOpportunities(request.careerOpportunities());
        entity.setStatus(request.status() != null ? request.status() : "Active");
        entity.setFacultySchool(request.facultySchool());
        entity.setDepartment(request.department());
        entity.setProgramCoordinator(request.programCoordinator());
        entity.setCampus(request.campus());
        entity.setDuration(request.duration());
        entity.setDurationUnit(request.durationUnit());
        entity.setNumberOfYears(request.numberOfYears());
        entity.setNumberOfSemesters(request.numberOfSemesters());
        entity.setSemestersPerYear(request.semestersPerYear());
        entity.setTotalCreditUnits(request.totalCreditUnits());
        entity.setStudyMode(request.studyMode());
        entity.setAcademicCalendar(request.academicCalendar());
        entity.setFees(request.fees());
        entity.setAdmissionRequirements(request.admissionRequirements());
        entity.setCurriculum(request.curriculum());
        entity.setIntakes(request.intakes());
        entity.setStudyOptions(request.studyOptions());
        entity.setAccreditation(request.accreditation());
        entity.setDocuments(request.documents());
        entity.setImageUrl(request.imageUrl());
        entity.setShortDescription(request.shortDescription());
        entity.setFullDescription(request.fullDescription());
        entity.setFeatured(request.featured() != null ? request.featured() : false);
        entity.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
        return entity;
    }

    public static ProgramResponse toDto(Program entity, List<String> categoryNames, Double cutoffScore) {
        return new ProgramResponse(
                entity.getId(),
                entity.getProgramName(),
                entity.getProgramCode(),
                entity.getProgramType(),
                entity.getAwardQualification(),
                entity.getProgramDescription(),
                entity.getProgramObjectives(),
                entity.getLearningOutcomes(),
                entity.getCareerOpportunities(),
                entity.getStatus(),
                entity.getFacultySchool(),
                entity.getDepartment(),
                entity.getProgramCoordinator(),
                entity.getCampus(),
                entity.getDuration(),
                entity.getDurationUnit(),
                entity.getNumberOfYears(),
                entity.getNumberOfSemesters(),
                entity.getSemestersPerYear(),
                entity.getTotalCreditUnits(),
                entity.getStudyMode(),
                entity.getAcademicCalendar(),
                entity.getFees(),
                entity.getAdmissionRequirements(),
                entity.getCurriculum(),
                entity.getIntakes(),
                entity.getStudyOptions(),
                entity.getAccreditation(),
                entity.getDocuments(),
                entity.getImageUrl(),
                entity.getShortDescription(),
                entity.getFullDescription(),
                entity.getFeatured(),
                entity.getDisplayOrder(),
                entity.getCreatedBy(),
                entity.getCreatedAt(),
                entity.getUpdatedBy(),
                entity.getUpdatedAt(),
                categoryNames,
                cutoffScore
        );
    }

    public static void updateEntity(Program entity, ProgramRequest request) {
        entity.setProgramName(request.programName());
        if (request.programCode() != null) entity.setProgramCode(request.programCode());
        if (request.programType() != null) entity.setProgramType(request.programType());
        if (request.awardQualification() != null) entity.setAwardQualification(request.awardQualification());
        if (request.programDescription() != null) entity.setProgramDescription(request.programDescription());
        if (request.programObjectives() != null) entity.setProgramObjectives(request.programObjectives());
        if (request.learningOutcomes() != null) entity.setLearningOutcomes(request.learningOutcomes());
        if (request.careerOpportunities() != null) entity.setCareerOpportunities(request.careerOpportunities());
        if (request.status() != null) entity.setStatus(request.status());
        if (request.facultySchool() != null) entity.setFacultySchool(request.facultySchool());
        if (request.department() != null) entity.setDepartment(request.department());
        if (request.programCoordinator() != null) entity.setProgramCoordinator(request.programCoordinator());
        if (request.campus() != null) entity.setCampus(request.campus());
        if (request.duration() != null) entity.setDuration(request.duration());
        if (request.durationUnit() != null) entity.setDurationUnit(request.durationUnit());
        if (request.numberOfYears() != null) entity.setNumberOfYears(request.numberOfYears());
        if (request.numberOfSemesters() != null) entity.setNumberOfSemesters(request.numberOfSemesters());
        if (request.semestersPerYear() != null) entity.setSemestersPerYear(request.semestersPerYear());
        if (request.totalCreditUnits() != null) entity.setTotalCreditUnits(request.totalCreditUnits());
        if (request.studyMode() != null) entity.setStudyMode(request.studyMode());
        if (request.academicCalendar() != null) entity.setAcademicCalendar(request.academicCalendar());
        if (request.fees() != null) entity.setFees(request.fees());
        if (request.admissionRequirements() != null) entity.setAdmissionRequirements(request.admissionRequirements());
        if (request.curriculum() != null) entity.setCurriculum(request.curriculum());
        if (request.intakes() != null) entity.setIntakes(request.intakes());
        if (request.studyOptions() != null) entity.setStudyOptions(request.studyOptions());
        if (request.accreditation() != null) entity.setAccreditation(request.accreditation());
        if (request.documents() != null) entity.setDocuments(request.documents());
        if (request.imageUrl() != null) entity.setImageUrl(request.imageUrl());
        if (request.shortDescription() != null) entity.setShortDescription(request.shortDescription());
        if (request.fullDescription() != null) entity.setFullDescription(request.fullDescription());
        if (request.featured() != null) entity.setFeatured(request.featured());
        if (request.displayOrder() != null) entity.setDisplayOrder(request.displayOrder());
    }
}
