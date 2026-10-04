package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.configuration.JwtUtil;
import org.nexus.napbackend.dto.StudentLoginResponse;
import org.nexus.napbackend.exception.NotAdmittedException;
import org.nexus.napbackend.exception.UnauthorizedException;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.repository.ApplicationRepository;
import org.nexus.napbackend.repository.ProgramRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Facade
public class StudentAuthFacade {

    private static final String ADMITTED = "ADMITTED";

    private final ApplicationRepository applicationRepository;
    private final ProgramRepository programRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public StudentAuthFacade(ApplicationRepository applicationRepository,
                             ProgramRepository programRepository,
                             PasswordEncoder passwordEncoder,
                             JwtUtil jwtUtil) {
        this.applicationRepository = applicationRepository;
        this.programRepository = programRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public StudentLoginResponse login(String email, String password) {
        Application application = findApplicantByEmail(email);
        if (application.getPasswordHash() == null) {
            throw new UnauthorizedException("No password set for this account. Please use forgot password.");
        }
        if (!passwordEncoder.matches(password, application.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        requireAdmitted(application);

        String token = jwtUtil.generateToken(application.getId(), application.getEmail(), "STUDENT");
        return new StudentLoginResponse(token, toUser(application), toProfile(application));
    }

    private void requireAdmitted(Application application) {
        if (ADMITTED.equals(application.getStatus())) {
            return;
        }
        String status = application.getStatus();
        String reason = switch (status == null ? "" : status) {
            case "REJECTED" -> "your application was not successful";
            case "WAITLISTED" -> "you are on the waiting list";
            case "DRAFT" -> "your application has not been submitted yet";
            default -> "your application is still being reviewed";
        };
        throw new NotAdmittedException(
                "The student portal opens once your admission is confirmed, but " + reason
                        + ". Current application status: " + status + ".");
    }

    @Transactional
    public StudentLoginResponse.StudentProfile resetPassword(String email, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }
        Application application = findApplicantByEmail(email);
        application.setPasswordHash(passwordEncoder.encode(newPassword));
        applicationRepository.save(application);
        return toProfile(application);
    }

    private Application findApplicantByEmail(String email) {
        List<Application> applications = applicationRepository.findByEmailOrderByCreatedAtDesc(email);
        if (applications.isEmpty()) {
            throw new UnauthorizedException("No application found for this email");
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
                a.getStudentNumber(),
                a.getRegistrationNumber(),
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
