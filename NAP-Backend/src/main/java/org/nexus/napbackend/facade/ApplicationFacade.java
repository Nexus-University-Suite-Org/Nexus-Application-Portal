package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.nexus.napbackend.dto.ApplicationCreateRequest;
import org.nexus.napbackend.dto.ApplicationResponse;
import org.nexus.napbackend.dto.NotificationCreateRequest;
import org.nexus.napbackend.mapper.ApplicationMapper;
import org.nexus.napbackend.mapper.NotificationMapper;
import org.nexus.napbackend.model.AdmissionScheme;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.service.ApplicationService;
import org.nexus.napbackend.service.NotificationService;
import org.nexus.napbackend.service.ProgramService;
import org.nexus.napbackend.service.StudentNumberService;
import org.nexus.napbackend.service.WeightingService;
import org.nexus.napbackend.scoring.AdmissionSchemeResolver;
import org.nexus.napbackend.scoring.ScoringService;

@Facade
public class ApplicationFacade {

    private final ApplicationService service;
    private final ProgramService programService;
    private final WeightingService weightingService;
    private final NotificationService notificationService;
<<<<<<< HEAD
    private final ScoringService scoringService;
    private final AdmissionSchemeResolver schemeResolver;
=======
    private final StudentNumberService studentNumberService;
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e

    public ApplicationFacade(ApplicationService service,
                             ProgramService programService,
                             WeightingService weightingService,
                             NotificationService notificationService,
<<<<<<< HEAD
                             ScoringService scoringService,
                             AdmissionSchemeResolver schemeResolver) {
=======
                             StudentNumberService studentNumberService) {
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
        this.service = service;
        this.programService = programService;
        this.weightingService = weightingService;
        this.notificationService = notificationService;
<<<<<<< HEAD
        this.scoringService = scoringService;
        this.schemeResolver = schemeResolver;
=======
        this.studentNumberService = studentNumberService;
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
    }

    @Transactional
    public ApplicationResponse create(ApplicationCreateRequest request) {
        Application entity = ApplicationMapper.toEntity(request);
        entity.setPrn(generatePrn());
        Application saved = service.create(entity);
        notifyApplicant(saved.getId(), "success", "Application Submitted",
                "Your application has been received and is under review. You will be notified when a decision is made.");
        return ApplicationMapper.toDto(saved);
    }

    @Transactional
    public ApplicationResponse submit(Long id) {
        Application entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        if (!entity.getEmailVerified()) {
            throw new RuntimeException("Email must be verified before submission");
        }
        entity.setStatus("SUBMITTED");
        entity.setSubmittedAt(LocalDateTime.now());

        // Score at submission, not at review. Submitting is the point at which the
        // applicant's own record stops changing, so this is the only moment the
        // index is stable; scoring later lets an officer edit a result first and
        // quietly change the decision. Review then re-derives the display values
        // from the same inputs without writing a second set of decision rows.
        AdmissionScheme scheme = schemeResolver.resolve(entity).orElse(null);
        scoringService.evaluateAndRecord(entity, programService.findAll(), scheme);

        Application updated = service.update(entity);
        return ApplicationMapper.toDto(updated);
    }

    @Transactional
    public ApplicationResponse review(Long id, String reviewStatus, String notes) {
        Application entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        if (!"SUBMITTED".equals(entity.getStatus()) && !"DRAFT".equals(entity.getStatus())) {
            throw new RuntimeException("Only SUBMITTED or DRAFT applications can be reviewed. Current status: " + entity.getStatus());
        }
        entity.setReviewStatus(reviewStatus.toUpperCase());
        entity.setReviewerNotes(notes);
        entity.setReviewedAt(LocalDateTime.now());

        List<Program> programmes = programService.findAll();
        AdmissionScheme scheme = schemeResolver.resolve(entity).orElse(null);
        String qualificationResultsJson = weightingService.evaluateAllChoices(entity, programmes, scheme);
        entity.setQualificationResults(qualificationResultsJson);

        if ("admitted".equals(reviewStatus.toLowerCase())) {
            entity.setStatus("ADMITTED");
            String assigned = weightingService.findAssignedProgramme(entity, programmes, scheme);
            entity.setAssignedProgramme(assigned);
            studentNumberService.assignIfAbsent(entity);
            try {
                var results = new com.fasterxml.jackson.databind.ObjectMapper()
                        .readValue(qualificationResultsJson, new com.fasterxml.jackson.core.type.TypeReference<List<org.nexus.napbackend.dto.QualificationResult>>() {});
                double maxScore = results.stream().mapToDouble(org.nexus.napbackend.dto.QualificationResult::adjustedScore).max().orElse(0);
                entity.setTotalWeightScore(maxScore);
            } catch (Exception ignored) {}
        } else if ("rejected".equals(reviewStatus.toLowerCase())) {
            entity.setStatus("REJECTED");
        } else if ("waitlisted".equals(reviewStatus.toLowerCase())) {
            entity.setStatus("WAITLISTED");
        }

        scoringService.recordHumanOutcome(entity.getId(), reviewStatus);

        String resolvedStatus = entity.getStatus();
        String notificationType = switch (resolvedStatus) {
            case "ADMITTED" -> "success";
            case "REJECTED" -> "warning";
            default -> "announcement";
        };
        notifyApplicant(entity.getId(), notificationType,
                "Application " + resolvedStatus,
                "Your application status has been updated to " + resolvedStatus + "."
                        + (notes != null && !notes.isBlank() ? " " + notes : ""));

        Application updated = service.update(entity);
        return ApplicationMapper.toDto(updated);
    }

    private void notifyApplicant(Long userId, String type, String title, String message) {
        NotificationCreateRequest request = new NotificationCreateRequest(
                userId, type, title, message, userId, "/notifications");
        notificationService.create(NotificationMapper.toEntity(request));
    }

    @Transactional
    public ApplicationResponse findById(Long id) {
        Application entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        return ApplicationMapper.toDto(entity);
    }

    @Transactional
    public List<ApplicationResponse> findAll() {
        return service.findAll().stream()
                .map(ApplicationMapper::toDto)
                .toList();
    }

    @Transactional
    public List<ApplicationResponse> findByEmail(String email) {
        return service.findByEmail(email).stream()
                .map(ApplicationMapper::toDto)
                .toList();
    }

    @Transactional
    public List<ApplicationResponse> findByStatus(String status) {
        return service.findByStatus(status).stream()
                .map(ApplicationMapper::toDto)
                .toList();
    }

    @Transactional
    public List<ApplicationResponse> findByReviewStatus(String reviewStatus) {
        return service.findByReviewStatus(reviewStatus).stream()
                .map(ApplicationMapper::toDto)
                .toList();
    }

    @Transactional
    public void delete(Long id) {
        service.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        service.deleteById(id);
    }

    private String generatePrn() {
        return "PRN-" + System.currentTimeMillis();
    }
}
