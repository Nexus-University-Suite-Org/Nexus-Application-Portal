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
import org.nexus.napbackend.exception.UnauthorizedException;
import org.nexus.napbackend.mapper.ApplicationMapper;
import org.nexus.napbackend.model.Admin;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.repository.ApplicationRepository;
import org.nexus.napbackend.service.AdminService;
import org.nexus.napbackend.service.StudentNumberService;
import org.nexus.napbackend.tenancy.TenantContext;
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
    private final StudentNumberService studentNumberService;

    public AdminFacade(AdminService adminService,
                       ApplicationRepository applicationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       StudentNumberService studentNumberService) {
        this.adminService = adminService;
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.studentNumberService = studentNumberService;
    }

    @Transactional
    public AdminLoginResponse login(AdminLoginRequest request) {
        Admin admin = adminService.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String role = resolveRole(admin);
        String token = jwtUtil.generateToken(admin.getId(), admin.getEmail(), role, admin.getTenantId());
        return new AdminLoginResponse(
                token, admin.getEmail(), admin.getFullName(), admin.getTenantId(), role);
    }

    @Transactional
    public AdminLoginResponse me(Long adminId) {
        Admin admin = adminService.findById(adminId)
                .orElseThrow(() -> new UnauthorizedException("Admin not found"));
        return new AdminLoginResponse(
                null, admin.getEmail(), admin.getFullName(), admin.getTenantId(), resolveRole(admin));
    }

    private String resolveRole(Admin admin) {
        String role = admin.getRole();
        return role == null || role.isBlank() ? "ADMIN" : role;
    }

    @Transactional
    public DashboardStatsResponse getDashboardStats() {
        Long tenantId = TenantContext.getCurrentTenantId();
        long total = applicationRepository.countByTenantId(tenantId);
        long pending = applicationRepository.countByTenantIdAndStatus(tenantId, "SUBMITTED");
        long admitted = applicationRepository.countByTenantIdAndStatus(tenantId, "ADMITTED");
        long rejected = applicationRepository.countByTenantIdAndStatus(tenantId, "REJECTED");
        long waitlisted = applicationRepository.countByTenantIdAndStatus(tenantId, "WAITLISTED");
        long draft = applicationRepository.countByTenantIdAndStatus(tenantId, "DRAFT");

        Map<String, Long> monthlyTrend = new LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i).toLocalDate();
            String key = month.format(DateTimeFormatter.ofPattern("MMM yyyy"));
            LocalDateTime startOfMonth = month.withDayOfMonth(1).atStartOfDay();
            LocalDateTime endOfMonth = month.withDayOfMonth(month.lengthOfMonth()).atTime(23, 59, 59);
            long count = applicationRepository.countByTenantIdAndCreatedAtBetween(
                    tenantId, startOfMonth, endOfMonth);
            monthlyTrend.put(key, count);
        }

        return new DashboardStatsResponse(total, pending, admitted, rejected, waitlisted, draft, monthlyTrend);
    }

    @Transactional
    public PaginatedApplicationsResponse getApplications(String status, String search, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Long tenantId = TenantContext.getCurrentTenantId();

        Page<Application> result;

        if (status != null && !status.isEmpty() && search != null && !search.isEmpty()) {
            String searchLower = "%" + search.toLowerCase() + "%";
            result = applicationRepository.findByTenantIdAndStatusAndSearch(
                    tenantId, status, searchLower, pageRequest);
        } else if (status != null && !status.isEmpty()) {
            result = applicationRepository.findByTenantIdAndStatusPaged(tenantId, status, pageRequest);
        } else if (search != null && !search.isEmpty()) {
            String searchLower = "%" + search.toLowerCase() + "%";
            result = applicationRepository.findByTenantIdAndSearch(tenantId, searchLower, pageRequest);
        } else {
            result = applicationRepository.findByTenantId(tenantId, pageRequest);
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
        Application app = applicationRepository
                .findByIdAndTenantId(id, TenantContext.getCurrentTenantId())
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        return ApplicationMapper.toDto(app);
    }

    @Transactional
    public ApplicationResponse reviewApplication(Long id, ReviewRequest request) {
        Application app = applicationRepository
                .findByIdAndTenantId(id, TenantContext.getCurrentTenantId())
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        if (!"SUBMITTED".equals(app.getStatus())) {
            throw new RuntimeException("Only SUBMITTED applications can be reviewed");
        }

        String reviewStatus = request.reviewStatus();
        app.setReviewStatus(reviewStatus);
        app.setReviewerNotes(request.notes());
        app.setReviewedAt(LocalDateTime.now());

        switch (reviewStatus) {
            case "admitted" -> {
                app.setStatus("ADMITTED");
                studentNumberService.assignIfAbsent(app);
            }
            case "rejected" -> app.setStatus("REJECTED");
            case "waitlisted" -> app.setStatus("WAITLISTED");
            default -> throw new RuntimeException("Invalid review status: " + reviewStatus);
        }

        Application updated = applicationRepository.save(app);
        return ApplicationMapper.toDto(updated);
    }
}
