package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.configuration.JwtUtil;
import org.nexus.napbackend.dto.StudentLoginResponse;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.model.Programme;
import org.nexus.napbackend.repository.ApplicationRepository;
import org.nexus.napbackend.repository.ProgrammeRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Facade
public class StudentAuthFacade {

    private final ApplicationRepository applicationRepository;
    private final ProgrammeRepository programmeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public StudentAuthFacade(ApplicationRepository applicationRepository,
                             ProgrammeRepository programmeRepository,
                             PasswordEncoder passwordEncoder,
                             JwtUtil jwtUtil) {
        this.applicationRepository = applicationRepository;
        this.programmeRepository = programmeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public StudentLoginResponse login(String email, String password) {
        Application application = findApplicantByEmail(email);
        if (application.getPasswordHash() == null) {
            throw new RuntimeException("No password set for this account. Please use forgot password.");
        }
        if (!passwordEncoder.matches(password, application.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(application.getId(), application.getEmail(), "STUDENT");
        return new StudentLoginResponse(token, toUser(application), toProfile(application));
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
            faculty = programmeRepository.findByNameIgnoreCase(programmeName)
                    .map(Programme::getFaculty)
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
