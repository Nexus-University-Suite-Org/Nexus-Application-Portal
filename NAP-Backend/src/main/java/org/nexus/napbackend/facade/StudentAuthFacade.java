package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.StudentLoginResponse;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.repository.ApplicationRepository;
import org.nexus.napbackend.repository.ProgramRepository;
import org.nexus.napbackend.service.IdentityGateway;
import org.nexus.napbackend.service.IdentityGateway.IdentitySession;

/**
 * Applicant-facing authentication.
 *
 * <p>Passwords live in Nexus Identity now. NAP still owns the application record
 * — programme choices, status, faculty — so after the identity service confirms
 * the credentials this facade joins the account back to its newest application
 * by email and returns that profile alongside the identity-issued token.
 */
@Facade
public class StudentAuthFacade {

    private final ApplicationRepository applicationRepository;
    private final ProgramRepository programRepository;
    private final IdentityGateway identityGateway;

    public StudentAuthFacade(ApplicationRepository applicationRepository,
                             ProgramRepository programRepository,
                             IdentityGateway identityGateway) {
        this.applicationRepository = applicationRepository;
        this.programRepository = programRepository;
        this.identityGateway = identityGateway;
    }

    @Transactional
    public StudentLoginResponse login(String email, String password) {
        IdentitySession session = identityGateway.authenticate(
                email, password, IdentityGateway.STUDENT_PORTAL_CLIENT);
        Application application = findApplicantByEmail(
                session.email() == null || session.email().isBlank() ? email : session.email());
        return new StudentLoginResponse(session.token(), toUser(application), toProfile(application));
    }

    /**
     * Starts a password reset through the identity service.
     *
     * <p>This replaced an endpoint that accepted an email and a new password
     * from anyone, which let a caller take over any account. It now only asks
     * the identity service to mail a single-use link.
     */
    public void requestPasswordReset(String email) {
        identityGateway.requestPasswordReset(email);
    }

    private Application findApplicantByEmail(String email) {
        List<Application> applications = applicationRepository.findByEmailOrderByCreatedAtDesc(email);
        if (applications.isEmpty()) {
            throw new RuntimeException("No application found for this email");
        }
        return applications.get(0);
    }

    private StudentLoginResponse.StudentUser toUser(Application a) {
        return new StudentLoginResponse.StudentUser(
                a.getId(),
                a.getEmail(),
                fullName(a),
                "student"
        );
    }

    private StudentLoginResponse.StudentProfile toProfile(Application a) {
        String faculty = null;
        String programmeName = a.getAssignedProgramme() != null ? a.getAssignedProgramme() : a.getProgramChoice1();
        if (programmeName != null && !programmeName.isBlank()) {
            faculty = programRepository.findByProgramNameIgnoreCaseAndDeletedAtIsNull(programmeName)
                    .map(Program::getFacultySchool)
                    .orElse(null);
        }
        return new StudentLoginResponse.StudentProfile(
                a.getId(),
                a.getPrn(),
                fullName(a),
                a.getEmail(),
                a.getPhoneNumber(),
                a.getProgramChoice1(),
                a.getProgramChoice2(),
                a.getProgramChoice3(),
                a.getProgramChoice4(),
                a.getAssignedProgramme(),
                a.getStatus(),
                a.getStudyMode(),
                a.getAcademicYear(),
                a.getStartDate(),
                faculty
        );
    }

    private String fullName(Application a) {
        StringBuilder sb = new StringBuilder();
        if (a.getFirstName() != null) sb.append(a.getFirstName());
        if (a.getLastName() != null) {
            if (!sb.isEmpty()) sb.append(" ");
            sb.append(a.getLastName());
        }
        return sb.toString();
    }
}
