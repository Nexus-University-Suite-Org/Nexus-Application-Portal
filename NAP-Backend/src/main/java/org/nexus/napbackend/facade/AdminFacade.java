package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.nexus.napbackend.configuration.JwtUtil;
import org.nexus.napbackend.dto.AdminLoginRequest;
import org.nexus.napbackend.dto.AdminLoginResponse;
import org.nexus.napbackend.dto.ApplicationResponse;
import org.nexus.napbackend.dto.DashboardStatsResponse;
import org.nexus.napbackend.dto.PaginatedApplicationsResponse;
import org.nexus.napbackend.dto.ReviewRequest;
import org.nexus.napbackend.mapper.ApplicationMapper;
import org.nexus.napbackend.model.Admin;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.repository.ApplicationRepository;
import org.nexus.napbackend.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminFacade {

    private final AdminService adminService;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminFacade(AdminService adminService,
                       ApplicationRepository applicationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.adminService = adminService;
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AdminLoginResponse login(AdminLoginRequest request) {
        Admin admin = adminService.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(admin.getId(), admin.getEmail());
        return new AdminLoginResponse(token, admin.getEmail(), admin.getFullName());
    }

    @Transactional
    public AdminLoginResponse me(Long adminId) {
        Admin admin = adminService.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return new AdminLoginResponse(null, admin.getEmail(), admin.getFullName());
    }

    @Transactional
    public DashboardStatsResponse getDashboardStats() {
        long total = applicationRepository.count();
        long pending = applicationRepository.countByStatus("SUBMITTED");
        long admitted = applicationRepository.countByStatus("ADMITTED");
        long rejected = applicationRepository.countByStatus("REJECTED");
        long waitlisted = applicationRepository.countByStatus("WAITLISTED");
        long draft = applicationRepository.countByStatus("DRAFT");

        Map<String, Long> monthlyTrend = new LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i).toLocalDate();
            String key = month.format(DateTimeFormatter.ofPattern("MMM yyyy"));
            LocalDateTime startOfMonth = month.withDayOfMonth(1).atStartOfDay();
            LocalDateTime endOfMonth = month.withDayOfMonth(month.lengthOfMonth()).atTime(23, 59, 59);
            long count = applicationRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);
            monthlyTrend.put(key, count);
        }

        return new DashboardStatsResponse(total, pending, admitted, rejected, waitlisted, draft, monthlyTrend);
    }

    @Transactional
    public PaginatedApplicationsResponse getApplications(String status, String search, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Application> result;

        if (status != null && !status.isEmpty() && search != null && !search.isEmpty()) {
            String searchLower = "%" + search.toLowerCase() + "%";
            result = applicationRepository.findByStatusAndSearch(status, searchLower, pageRequest);
        } else if (status != null && !status.isEmpty()) {
            result = applicationRepository.findByStatusPaged(status, pageRequest);
        } else if (search != null && !search.isEmpty()) {
            String searchLower = "%" + search.toLowerCase() + "%";
            result = applicationRepository.findBySearch(searchLower, pageRequest);
        } else {
            result = applicationRepository.findAll(pageRequest);
        }

        List<ApplicationResponse> content = result.getContent().stream()
                .map(ApplicationMapper::toDto)
                .toList();

        return new PaginatedApplicationsResponse(
                content,
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber(),
                result.getSize()
        );
    }

    @Transactional
    public ApplicationResponse getApplicationById(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        return ApplicationMapper.toDto(app);
    }

    @Transactional
    public ApplicationResponse reviewApplication(Long id, ReviewRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        if (!"SUBMITTED".equals(app.getStatus())) {
            throw new RuntimeException("Only SUBMITTED applications can be reviewed");
        }

        String reviewStatus = request.reviewStatus();
        app.setReviewStatus(reviewStatus);
        app.setReviewerNotes(request.notes());
        app.setReviewedAt(LocalDateTime.now());

        switch (reviewStatus) {
            case "admitted" -> app.setStatus("ADMITTED");
            case "rejected" -> app.setStatus("REJECTED");
            case "waitlisted" -> app.setStatus("WAITLISTED");
            default -> throw new RuntimeException("Invalid review status: " + reviewStatus);
        }

        Application updated = applicationRepository.save(app);
        return ApplicationMapper.toDto(updated);
    }
}
