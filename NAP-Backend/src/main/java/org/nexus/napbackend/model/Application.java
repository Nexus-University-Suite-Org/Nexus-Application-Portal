package org.nexus.napbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "applications")
@Getter
@Setter
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "prn", unique = true, length = 50)
    private String prn;

    @Column(name = "registration_number", unique = true, length = 50)
    private String registrationNumber;

    @Column(name = "student_number", unique = true, length = 50)
    private String studentNumber;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "other_names", length = 100)
    private String otherNames;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(name = "password_hash", columnDefinition = "text")
    private String passwordHash;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(length = 20)
    private String gender;

    @Column(name = "date_of_birth", length = 50)
    private String dateOfBirth;

    @Column(name = "marital_status", length = 30)
    private String maritalStatus;

    @Column(length = 200)
    private String nationality;

    @Column(length = 300)
    private String address;

    @Column(name = "postal_address", length = 300)
    private String postalAddress;

    @Column(length = 100)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(length = 100)
    private String country;

    @Column(length = 200)
    private String district;

    @Column(length = 200)
    private String subcounty;

    @Column(length = 200)
    private String village;

    @Column(name = "has_national_id_or_passport", length = 10)
    private String hasNationalIdOrPassport;

    @Column(name = "birth_certificate_or_national_id_details", columnDefinition = "text")
    private String birthCertificateOrNationalIdDetails;

    @Column(name = "passport_photo_uploaded")
    private Boolean passportPhotoUploaded;

    @Column(name = "passport_photo_url", columnDefinition = "text")
    private String passportPhotoUrl;

    @Column(name = "guardian_name", length = 200)
    private String guardianName;

    @Column(name = "guardian_type", length = 50)
    private String guardianType;

    @Column(name = "guardian_phone", length = 30)
    private String guardianPhone;

    @Column(name = "next_of_kin_relationship", length = 100)
    private String nextOfKinRelationship;

    @Column(name = "is_ugandan", length = 10)
    private String isUgandan;

    @Column(name = "application_type", length = 100)
    private String applicationType;

    @Column(name = "entry_scheme", length = 100)
    private String entryScheme;

    @Column(name = "program_choice_1", length = 200)
    private String programChoice1;

    @Column(name = "program_choice_2", length = 200)
    private String programChoice2;

    @Column(name = "program_choice_3", length = 200)
    private String programChoice3;

    @Column(name = "start_date", length = 50)
    private String startDate;

    @Column(name = "previous_institution", length = 300)
    private String previousInstitution;

    @Column(name = "highest_qualification", length = 100)
    private String highestQualification;

    @Column(name = "academic_credential_level", length = 200)
    private String academicCredentialLevel;

    @Column(name = "academic_credentials_details", columnDefinition = "text")
    private String academicCredentialsDetails;

    @Column(name = "birth_certificate_url", columnDefinition = "text")
    private String birthCertificateUrl;

    @Column(name = "study_mode", length = 50)
    private String studyMode;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(length = 20)
    private String semester;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "review_status", length = 32)
    private String reviewStatus;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewer_notes")
    private String reviewerNotes;

    @Column(name = "uce_result", columnDefinition = "text")
    private String uceResult;

    @Column(name = "uace_result", columnDefinition = "text")
    private String uaceResult;

    @Column(columnDefinition = "text")
    private String documents;

    @Column(columnDefinition = "text")
    private String extras;

    @Column(name = "fee_paid", precision = 14, scale = 2)
    private java.math.BigDecimal feePaid;

    @Column(name = "fee_required", precision = 14, scale = 2)
    private java.math.BigDecimal feeRequired;

    @Column(name = "fee_currency", length = 3)
    private String feeCurrency;

    @Column(name = "uce_index_number", length = 30)
    private String uceIndexNumber;

    @Column(name = "uce_year_of_sitting", length = 10)
    private String uceYearOfSitting;

    @Column(name = "uce_second_sitting")
    private Boolean uceSecondSitting;

    @Column(name = "uce_second_index_number", length = 30)
    private String uceSecondIndexNumber;

    @Column(name = "uce_second_year_of_sitting", length = 10)
    private String uceSecondYearOfSitting;

    @Column(name = "uce_total_aggregates", length = 10)
    private String uceTotalAggregates;

    @Column(name = "uce_division", length = 5)
    private String uceDivision;

    @Column(name = "o_level_school_name", length = 200)
    private String oLevelSchoolName;

    @Column(name = "uace_index_number", length = 30)
    private String uaceIndexNumber;

    @Column(name = "uace_year_of_sitting", length = 10)
    private String uaceYearOfSitting;

    @Column(name = "uace_second_sitting")
    private Boolean uaceSecondSitting;

    @Column(name = "uace_second_index_number", length = 30)
    private String uaceSecondIndexNumber;

    @Column(name = "uace_second_year_of_sitting", length = 10)
    private String uaceSecondYearOfSitting;

    @Column(name = "uace_total_points", length = 10)
    private String uaceTotalPoints;

    @Column(name = "uace_principal_subjects", columnDefinition = "text")
    private String uacePrincipalSubjects;

    @Column(name = "uace_general_paper_grade", length = 10)
    private String uaceGeneralPaperGrade;

    @Column(name = "uace_ict_or_sub_math_subject", length = 100)
    private String uaceIctOrSubMathSubject;

    @Column(name = "uace_ict_or_sub_math_grade", length = 10)
    private String uaceIctOrSubMathGrade;

    @Column(name = "o_level_result_slip_url", columnDefinition = "text")
    private String oLevelResultSlipUrl;

    @Column(name = "a_level_result_slip_url", columnDefinition = "text")
    private String aLevelResultSlipUrl;

    @Column(name = "academic_transcript_url", columnDefinition = "text")
    private String academicTranscriptUrl;

    @Column(name = "national_id_or_passport_url", columnDefinition = "text")
    private String nationalIdOrPassportUrl;

    @Column(name = "country_id_document_url", columnDefinition = "text")
    private String countryIdDocumentUrl;

    @Column(name = "referee_letter_url", columnDefinition = "text")
    private String refereeLetterUrl;

    @Column(name = "personal_statement_attachment_url", columnDefinition = "text")
    private String personalStatementAttachmentUrl;

    @Column(name = "o_level_subjects", columnDefinition = "text")
    private String oLevelSubjects;

    @Column(name = "certificate_subjects", columnDefinition = "text")
    private String certificateSubjects;

    @Column(length = 10)
    private String gpa;

    @Column(name = "personal_statement", columnDefinition = "text")
    private String personalStatement;

    @Column(name = "how_did_you_hear", length = 100)
    private String howDidYouHear;

    @Column(name = "documents_confirmed")
    private Boolean documentsConfirmed;

    @Column(name = "transcript_uploaded")
    private Boolean transcriptUploaded;

    @Column(name = "id_uploaded")
    private Boolean idUploaded;

    @Column(name = "country_id_uploaded")
    private Boolean countryIdUploaded;

    @Column(name = "recommendation_uploaded")
    private Boolean recommendationUploaded;

    @Column(name = "statement_uploaded")
    private Boolean statementUploaded;

    @Column(name = "application_fee_paid")
    private Boolean applicationFeePaid;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @Column(name = "interview_preference", length = 100)
    private String interviewPreference;

    @Column(name = "program_choice_4", length = 200)
    private String programChoice4;

    @Column(name = "assigned_programme", length = 20)
    private String assignedProgramme;

    @Column(name = "total_weight_score")
    private Double totalWeightScore;

    @Column(name = "qualification_results", columnDefinition = "text")
    private String qualificationResults;

    @Column(name = "terms_accepted")
    private Boolean termsAccepted;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
