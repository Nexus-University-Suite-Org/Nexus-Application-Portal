package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.ApplicationCreateRequest;
import org.nexus.napbackend.dto.ApplicationResponse;
import org.nexus.napbackend.model.Application;

public final class ApplicationMapper {

    private ApplicationMapper() {
    }

    public static Application toEntity(ApplicationCreateRequest request) {
        Application entity = new Application();
        entity.setFirstName(request.firstName());
        entity.setLastName(request.lastName());
        entity.setOtherNames(request.otherNames());
        entity.setEmail(request.email());
        entity.setPhoneNumber(request.phoneNumber());
        entity.setGender(request.gender());
        entity.setNationality(request.nationality());
        entity.setDistrict(request.district());
        entity.setSubcounty(request.subcounty());
        entity.setVillage(request.village());
        entity.setProgramChoice1(request.programChoice1());
        entity.setProgramChoice2(request.programChoice2());
        entity.setProgramChoice3(request.programChoice3());
        entity.setStudyMode(request.studyMode());
        entity.setAcademicYear(request.academicYear());
        entity.setSemester(request.semester());
        entity.setUceResult(request.uceResult());
        entity.setUaceResult(request.uaceResult());
        entity.setDocuments(request.documents());
        entity.setExtras(request.extras());
        entity.setFeePaid(request.feePaid());
        entity.setFeeRequired(request.feeRequired());
        entity.setFeeCurrency(request.feeCurrency() != null ? request.feeCurrency() : "UGX");
        entity.setEmailVerified(false);
        entity.setStatus("DRAFT");
        return entity;
    }

    public static ApplicationResponse toDto(Application entity) {
        return new ApplicationResponse(
                entity.getId(),
                entity.getPrn(),
                entity.getFirstName(),
                entity.getLastName(),
                entity.getOtherNames(),
                entity.getEmail(),
                entity.getPhoneNumber(),
                entity.getGender(),
                entity.getNationality(),
                entity.getDistrict(),
                entity.getProgramChoice1(),
                entity.getProgramChoice2(),
                entity.getProgramChoice3(),
                entity.getStudyMode(),
                entity.getAcademicYear(),
                entity.getSemester(),
                entity.getEmailVerified(),
                entity.getStatus(),
                entity.getReviewStatus(),
                entity.getSubmittedAt(),
                entity.getReviewedAt(),
                entity.getReviewerNotes(),
                entity.getUceResult(),
                entity.getUaceResult(),
                entity.getDocuments(),
                entity.getExtras(),
                entity.getFeePaid(),
                entity.getFeeRequired(),
                entity.getFeeCurrency(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
