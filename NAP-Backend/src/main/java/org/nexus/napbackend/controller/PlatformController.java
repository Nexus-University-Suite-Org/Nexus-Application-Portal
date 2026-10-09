package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.nexus.napbackend.dto.AdminAccountResponse;
import org.nexus.napbackend.dto.CreateAdminRequest;
import org.nexus.napbackend.dto.CreateTenantRequest;
import org.nexus.napbackend.dto.TenantResponse;
import org.nexus.napbackend.dto.UpdateTenantStatusRequest;
import org.nexus.napbackend.model.Admin;
import org.nexus.napbackend.model.Tenant;
import org.nexus.napbackend.repository.AdminRepository;
import org.nexus.napbackend.service.AdminService;
import org.nexus.napbackend.service.TenantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Platform operations for the super-admin: onboard universities (tenants) and
 * provision each one's admin account. Every endpoint requires the
 * {@code SUPER_ADMIN} role, enforced in {@code SecurityConfig}.
 */
@RestController
@RequestMapping("/api/v1/platform")
public class PlatformController {

    private final TenantService tenantService;
    private final AdminService adminService;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public PlatformController(TenantService tenantService,
                              AdminService adminService,
                              AdminRepository adminRepository,
                              PasswordEncoder passwordEncoder) {
        this.tenantService = tenantService;
        this.adminService = adminService;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<TenantResponse>> listTenants() {
        List<TenantResponse> tenants = tenantService.findAll().stream()
                .map(this::toTenantResponse)
                .toList();
        return ResponseEntity.ok(tenants);
    }

    @PostMapping("/tenants")
    public ResponseEntity<TenantResponse> createTenant(@Valid @RequestBody CreateTenantRequest request) {
        Tenant tenant = tenantService.create(request.name(), request.code(), request.domain());
        return ResponseEntity.status(HttpStatus.CREATED).body(toTenantResponse(tenant));
    }

    @PatchMapping("/tenants/{tenantId}/status")
    public ResponseEntity<TenantResponse> setTenantStatus(@PathVariable Long tenantId,
                                                          @Valid @RequestBody UpdateTenantStatusRequest request) {
        Tenant tenant = tenantService.setActive(tenantId, request.active());
        return ResponseEntity.ok(toTenantResponse(tenant));
    }

    @GetMapping("/tenants/{tenantId}/admins")
    public ResponseEntity<List<AdminAccountResponse>> listAdmins(@PathVariable Long tenantId) {
        tenantService.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));
        List<AdminAccountResponse> admins = adminService.findAllByTenant(tenantId).stream()
                .map(this::toAdminResponse)
                .toList();
        return ResponseEntity.ok(admins);
    }

    @PostMapping("/tenants/{tenantId}/admins")
    public ResponseEntity<AdminAccountResponse> createAdmin(@PathVariable Long tenantId,
                                                            @Valid @RequestBody CreateAdminRequest request) {
        Tenant tenant = tenantService.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));
        if (!tenant.getActive()) {
            throw new IllegalArgumentException("Cannot add an admin to a disabled tenant");
        }

        String email = request.email().trim().toLowerCase();
        if (adminService.existsByEmail(email)) {
            throw new IllegalArgumentException("An admin already exists with email " + email);
        }

        Admin admin = new Admin();
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(request.password()));
        admin.setFullName(request.fullName().trim());
        admin.setTenantId(tenantId);
        admin.setRole("ADMIN");
        Admin saved = adminService.create(admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(toAdminResponse(saved));
    }

    private TenantResponse toTenantResponse(Tenant tenant) {
        return new TenantResponse(
                tenant.getId(),
                tenant.getCode(),
                tenant.getName(),
                tenant.getDomain(),
                Boolean.TRUE.equals(tenant.getActive()),
                tenant.getCreatedAt(),
                adminRepository.countByTenantId(tenant.getId()));
    }

    private AdminAccountResponse toAdminResponse(Admin admin) {
        return new AdminAccountResponse(
                admin.getId(),
                admin.getEmail(),
                admin.getFullName(),
                admin.getTenantId(),
                admin.getRole(),
                admin.getCreatedAt());
    }
}