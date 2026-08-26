package org.nexus.napbackend.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.nexus.napbackend.dto.ApplicationCreateRequest;
import org.nexus.napbackend.dto.ApplicationResponse;
import org.nexus.napbackend.model.Application;

public final class ApplicationMapper {

    private static final ObjectMapper mapper = new ObjectMapper();

    private ApplicationMapper() {
    }

    private static String toJson(Object value) {
        if (value == null) return null;
        if (value instanceof String s) return s;
        try {
            return mapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return value.toString();
        }
    }

    public static Application toEntity(ApplicationCreateRequest r) {
        Application e = new Application();
        e.setFirstName(r.firstName());
        e.setLastName(r.lastName());
        e.setOtherNames(r.otherNames());
        e.setEmail(r.email());
        e.setPhoneNumber(r.phoneNumber());
        e.setGender(r.gender());
        e.setDateOfBirth(r.dateOfBirth());
        e.setMaritalStatus(r.maritalStatus());
        e.setNationality(r.nationality());
        e.setAddress(r.address());
        e.setPostalAddress(r.postalAddress());
        e.setCity(r.city());
        e.setPostalCode(r.postalCode());
        e.setCountry(r.country());
        e.setDistrict(r.district());
        e.setSubcounty(r.subcounty());
        e.setVillage(r.village());
        e.setHasNationalIdOrPassport(r.hasNationalIdOrPassport());
        e.setBirthCertificateOrNationalIdDetails(r.birthCertificateOrNationalIdDetails());
        e.setPassportPhotoUploaded(r.passportPhotoUploaded());
        e.setPassportPhotoUrl(r.passportPhotoUrl());
        e.setGuardianName(r.guardianName());
        e.setGuardianType(r.guardianType());
        e.setGuardianPhone(r.guardianPhone());
        e.setNextOfKinRelationship(r.nextOfKinRelationship());
        e.setIsUgandan(r.isUgandan());
        e.setApplicationType(r.applicationType());
        e.setEntryScheme(r.entryScheme());
        e.setProgramChoice1(r.programChoice1());
        e.setProgramChoice2(r.programChoice2());
        e.setProgramChoice3(r.programChoice3());
        e.setStartDate(r.startDate());
        e.setPreviousInstitution(r.previousInstitution());
        e.setHighestQualification(r.highestQualification());
        e.setAcademicCredentialLevel(r.academicCredentialLevel());
        e.setAcademicCredentialsDetails(r.academicCredentialsDetails());
        e.setBirthCertificateUrl(r.birthCertificateUrl());
        e.setStudyMode(r.studyMode());
        e.setAcademicYear(r.academicYear());
        e.setSemester(r.semester());
        e.setUceResult(r.uceResult());
        e.setUaceResult(r.uaceResult());
        e.setDocuments(r.documents());
        e.setExtras(r.extras());
        e.setUceIndexNumber(r.uceIndexNumber());
        e.setUceYearOfSitting(r.uceYearOfSitting());
        e.setUceSecondSitting(r.uceSecondSitting());
        e.setUceSecondIndexNumber(r.uceSecondIndexNumber());
        e.setUceSecondYearOfSitting(r.uceSecondYearOfSitting());
        e.setUceTotalAggregates(r.uceTotalAggregates());
        e.setUceDivision(r.uceDivision());
        e.setOLevelSchoolName(r.oLevelSchoolName());
        e.setUaceIndexNumber(r.uaceIndexNumber());
        e.setUaceYearOfSitting(r.uaceYearOfSitting());
        e.setUaceSecondSitting(r.uaceSecondSitting());
        e.setUaceSecondIndexNumber(r.uaceSecondIndexNumber());
        e.setUaceSecondYearOfSitting(r.uaceSecondYearOfSitting());
        e.setUaceTotalPoints(r.uaceTotalPoints());
        e.setUacePrincipalSubjects(toJson(r.uacePrincipalSubjects()));
        e.setUaceGeneralPaperGrade(r.uaceGeneralPaperGrade());
        e.setUaceIctOrSubMathSubject(r.uaceIctOrSubMathSubject());
        e.setUaceIctOrSubMathGrade(r.uaceIctOrSubMathGrade());
        e.setOLevelResultSlipUrl(r.oLevelResultSlipUrl());
        e.setALevelResultSlipUrl(r.aLevelResultSlipUrl());
        e.setAcademicTranscriptUrl(r.academicTranscriptUrl());
        e.setNationalIdOrPassportUrl(r.nationalIdOrPassportUrl());
        e.setCountryIdDocumentUrl(r.countryIdDocumentUrl());
        e.setRefereeLetterUrl(r.refereeLetterUrl());
        e.setPersonalStatementAttachmentUrl(r.personalStatementAttachmentUrl());
        e.setOLevelSubjects(toJson(r.oLevelSubjects()));
        e.setCertificateSubjects(toJson(r.certificateSubjects()));
        e.setGpa(r.gpa());
        e.setPersonalStatement(r.personalStatement());
        e.setHowDidYouHear(r.howDidYouHear());
        e.setDocumentsConfirmed(r.documentsConfirmed());
        e.setTranscriptUploaded(r.transcriptUploaded());
        e.setIdUploaded(r.idUploaded());
        e.setCountryIdUploaded(r.countryIdUploaded());
        e.setRecommendationUploaded(r.recommendationUploaded());
        e.setStatementUploaded(r.statementUploaded());
        e.setApplicationFeePaid(r.applicationFeePaid());
        e.setPaymentMethod(r.paymentMethod());
        e.setPaymentReference(r.paymentReference());
        e.setInterviewPreference(r.interviewPreference());
        e.setTermsAccepted(r.termsAccepted());
        e.setEmailVerified(Boolean.TRUE.equals(r.emailVerified()));
        e.setStatus("DRAFT");
        return e;
    }

    public static ApplicationResponse toDto(Application e) {
        return new ApplicationResponse(
                e.getId(),
                e.getPrn(),
                e.getFirstName(),
                e.getLastName(),
                e.getOtherNames(),
                e.getEmail(),
                e.getPhoneNumber(),
                e.getGender(),
                e.getDateOfBirth(),
                e.getMaritalStatus(),
                e.getNationality(),
                e.getAddress(),
                e.getPostalAddress(),
                e.getCity(),
                e.getPostalCode(),
                e.getCountry(),
                e.getDistrict(),
                e.getSubcounty(),
                e.getVillage(),
                e.getHasNationalIdOrPassport(),
                e.getBirthCertificateOrNationalIdDetails(),
                e.getPassportPhotoUploaded(),
                e.getPassportPhotoUrl(),
                e.getGuardianName(),
                e.getGuardianType(),
                e.getGuardianPhone(),
                e.getNextOfKinRelationship(),
                e.getIsUgandan(),
                e.getApplicationType(),
                e.getEntryScheme(),
                e.getProgramChoice1(),
                e.getProgramChoice2(),
                e.getProgramChoice3(),
                e.getStartDate(),
                e.getPreviousInstitution(),
                e.getHighestQualification(),
                e.getAcademicCredentialLevel(),
                e.getAcademicCredentialsDetails(),
                e.getBirthCertificateUrl(),
                e.getStudyMode(),
                e.getAcademicYear(),
                e.getSemester(),
                e.getEmailVerified(),
                e.getStatus(),
                e.getReviewStatus(),
                e.getSubmittedAt(),
                e.getReviewedAt(),
                e.getReviewerNotes(),
                e.getUceResult(),
                e.getUaceResult(),
                e.getDocuments(),
                e.getExtras(),
                e.getUceIndexNumber(),
                e.getUceYearOfSitting(),
                e.getUceSecondSitting(),
                e.getUceSecondIndexNumber(),
                e.getUceSecondYearOfSitting(),
                e.getUceTotalAggregates(),
                e.getUceDivision(),
                e.getOLevelSchoolName(),
                e.getUaceIndexNumber(),
                e.getUaceYearOfSitting(),
                e.getUaceSecondSitting(),
                e.getUaceSecondIndexNumber(),
                e.getUaceSecondYearOfSitting(),
                e.getUaceTotalPoints(),
                e.getUacePrincipalSubjects(),
                e.getUaceGeneralPaperGrade(),
                e.getUaceIctOrSubMathSubject(),
                e.getUaceIctOrSubMathGrade(),
                e.getOLevelResultSlipUrl(),
                e.getALevelResultSlipUrl(),
                e.getAcademicTranscriptUrl(),
                e.getNationalIdOrPassportUrl(),
                e.getCountryIdDocumentUrl(),
                e.getRefereeLetterUrl(),
                e.getPersonalStatementAttachmentUrl(),
                e.getOLevelSubjects(),
                e.getCertificateSubjects(),
                e.getGpa(),
                e.getPersonalStatement(),
                e.getHowDidYouHear(),
                e.getDocumentsConfirmed(),
                e.getTranscriptUploaded(),
                e.getIdUploaded(),
                e.getCountryIdUploaded(),
                e.getRecommendationUploaded(),
                e.getStatementUploaded(),
                e.getApplicationFeePaid(),
                e.getPaymentMethod(),
                e.getPaymentReference(),
                e.getInterviewPreference(),
                e.getTermsAccepted(),
                e.getFeePaid(),
                e.getFeeRequired(),
                e.getFeeCurrency(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
