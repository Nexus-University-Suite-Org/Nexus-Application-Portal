package org.nexus.napbackend.service;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.nexus.napbackend.dto.ContactRequest;
import org.nexus.napbackend.dto.ContactResponse;
import org.nexus.napbackend.model.ContactSubmission;
import org.nexus.napbackend.repository.ContactSubmissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);
    private static final long DEMO_TENANT_ID = 1L;
    private static final DateTimeFormatter RECEIVED_AT_FORMAT =
            DateTimeFormatter.ofPattern("EEEE, d MMMM uuuu 'at' HH:mm").withLocale(java.util.Locale.ENGLISH);

    private final ContactSubmissionRepository repository;
    private final EmailJsSender emailJsSender;
    private final ContactMailService contactMailService;
    private final ExecutorService notificationExecutor;

    public ContactService(ContactSubmissionRepository repository, EmailJsSender emailJsSender,
                          ContactMailService contactMailService) {
        this.repository = repository;
        this.emailJsSender = emailJsSender;
        this.contactMailService = contactMailService;
        this.notificationExecutor = Executors.newVirtualThreadPerTaskExecutor();
    }

    @Transactional
    public ContactResponse register(ContactRequest request, String ipAddress) {
        ContactSubmission submission = new ContactSubmission();
        submission.setTenantId(DEMO_TENANT_ID);
        submission.setName(request.name().trim());
        submission.setEmail(request.email().trim());
        submission.setSubject(request.subject() == null || request.subject().isBlank()
                ? "(no subject)"
                : request.subject().trim());
        submission.setMessage(request.message().trim());
        submission.setSource("contact-page");
        submission.setStatus("NEW");
        submission.setIpAddress(ipAddress);
        submission.setCreatedAt(LocalDateTime.now());
        Long id = repository.save(submission).getId();

        String name = submission.getName();
        String email = submission.getEmail();
        String subject = submission.getSubject();
        String message = submission.getMessage();
        String receivedAt = RECEIVED_AT_FORMAT.format(ZonedDateTime.now(java.time.ZoneId.of("Africa/Kampala")));
        notificationExecutor.submit(() -> {
            log.info("Attempting EmailJS notification for submission id={}", id);
            deliverNotification(id, name, email, subject, message, receivedAt);
        });

        return new ContactResponse(id, false);
    }

    private void deliverNotification(Long id, String name, String email, String subject, String message,
                                     String receivedAt) {
        boolean delivered = contactMailService.send(name, email, subject, message, receivedAt);
        if (!delivered) {
            log.info("SMTP delivery not used for submission id={}; falling back to EmailJS", id);
            delivered = emailJsSender.send(name, email, subject, message, receivedAt);
        }
        log.info("Notification result for submission id={}: delivered={}", id, delivered);
        if (delivered) {
            markEmailed(id);
        }
    }

    private void markEmailed(Long id) {
        try {
            repository.findById(id).ifPresent(submission -> {
                submission.setEmailedAt(LocalDateTime.now());
                repository.save(submission);
            });
        } catch (Exception ex) {
            log.warn("Could not stamp emailed_at for contact submission {}: {}", id, ex.getMessage());
        }
    }
}
