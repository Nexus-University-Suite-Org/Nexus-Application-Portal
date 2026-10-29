package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
<<<<<<< HEAD
import java.util.function.Consumer;
import java.util.function.Supplier;
import org.nexus.napbackend.configuration.NexusRoles;
=======
import org.nexus.napbackend.configuration.JwtUtil;
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
import org.nexus.napbackend.dto.AdminLoginRequest;
import org.nexus.napbackend.dto.AdminLoginResponse;
import org.nexus.napbackend.dto.ApplicationResponse;
import org.nexus.napbackend.dto.DashboardStatsResponse;
import org.nexus.napbackend.dto.PaginatedApplicationsResponse;
import org.nexus.napbackend.dto.ReviewRequest;
import org.nexus.napbackend.exception.UnauthorizedException;
import org.nexus.napbackend.mapper.ApplicationMapper;
import org.nexus.napbackend.model.Application;
import org.nexus.napbackend.repository.ApplicationRepository;
<<<<<<< HEAD
import org.nexus.napbackend.service.IdentityGateway;
import org.nexus.napbackend.service.IdentityGateway.IdentitySession;
=======
import org.nexus.napbackend.service.AdminService;
import org.nexus.napbackend.service.StudentNumberService;
import org.nexus.napbackend.service.TenantService;
import org.nexus.napbackend.tenancy.TenantContext;
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class AdminFacade {

    private final ApplicationRepository applicationRepository;
<<<<<<< HEAD
    private final IdentityGateway identityGateway;

    public AdminFacade(ApplicationRepository applicationRepository, IdentityGateway identityGateway) {
        this.applicationRepository = applicationRepository;
        this.identityGateway = identityGateway;
=======
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StudentNumberService studentNumberService;
    private final TenantService tenantService;

    public AdminFacade(AdminService adminService,
                       ApplicationRepository applicationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       StudentNumberService studentNumberService,
                       TenantService tenantService) {
        this.adminService = adminService;
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.studentNumberService = studentNumberService;
        this.tenantService = tenantService;
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
    }

    /**
     * Transitional login shim.
     *
     * <p>Credentials and the resulting token both come from Nexus Identity. The
     * local {@code admins} table is no longer an authority on who may sign in.
     */
    @Transactional
    public AdminLoginResponse login(AdminLoginRequest request) {
        IdentitySession session = identityGateway.authenticate(
                request.email(), request.password(), IdentityGateway.APPLICATION_PORTAL_CLIENT);
        // The app-portal client also accepts applicants and students. Without this
        // check they would get a "successful" login carrying a token that every
        // admin route then rejects, which is a confusing half-signed-in state.
        boolean entitled = session.roles() != null
                && session.roles().stream().anyMatch(NexusRoles.ADMIN::contains);
        if (!entitled) {
            throw new UnauthorizedException("This account is not entitled to use this portal.");
        }
<<<<<<< HEAD
        String name = session.name() == null || session.name().isBlank()
                ? session.email() : session.name();
        return new AdminLoginResponse(session.token(), session.email(), name);
    }

    /** Reads the profile straight from the validated access token. */
    public AdminLoginResponse me(Jwt jwt) {
        if (jwt == null) {
            throw new UnauthorizedException("Not signed in");
        }
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        return new AdminLoginResponse(null, email, name == null ? email : name);
=======

        if (admin.getTenantId() != null) {
            tenantService.findById(admin.getTenantId())
                    .filter(tenant -> Boolean.TRUE.equals(tenant.getActive()))
                    .orElseThrow(() -> new UnauthorizedException(
                            "This university's admin portal is currently disabled"));
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
    public void changePassword(Long adminId, String currentPassword, String newPassword) {
        Admin admin = adminService.findById(adminId)
                .orElseThrow(() -> new UnauthorizedException("Admin not found"));

        if (!passwordEncoder.matches(currentPassword, admin.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        if (passwordEncoder.matches(newPassword, admin.getPasswordHash())) {
            throw new IllegalArgumentException(
                    "New password must be different from the current password");
        }

        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        adminService.save(admin);
    }

    @Transactional
    public void resetPassword(Long adminId, String newPassword) {
        Admin admin = adminService.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + adminId));
        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        adminService.save(admin);
>>>>>>> 2c9811f3bd3db583d5fc06dc3c41fc3d91caa31e
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
