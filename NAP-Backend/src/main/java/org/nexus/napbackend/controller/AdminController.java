package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.nexus.napbackend.configuration.JwtAuthFilter;
import org.nexus.napbackend.dto.AdminLoginRequest;
import org.nexus.napbackend.dto.AdminLoginResponse;
import org.nexus.napbackend.dto.ApplicationResponse;
import org.nexus.napbackend.dto.DashboardStatsResponse;
import org.nexus.napbackend.dto.PaginatedApplicationsResponse;
import org.nexus.napbackend.dto.ReviewRequest;
import org.nexus.napbackend.facade.AdminFacade;
import org.nexus.napbackend.model.Admin;
import org.nexus.napbackend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminFacade adminFacade;
    private final AdminService adminService;

    public AdminController(AdminFacade adminFacade, AdminService adminService) {
        this.adminFacade = adminFacade;
        this.adminService = adminService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(adminFacade.login(request));
    }

    @GetMapping("/auth/me")
    public ResponseEntity<AdminLoginResponse> me(Authentication authentication) {
        JwtAuthFilter.AdminPrincipal principal = (JwtAuthFilter.AdminPrincipal) authentication.getPrincipal();
        AdminLoginResponse response = new AdminLoginResponse(null, principal.email(), null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<Map<String, Object>> users = adminService.findAll().stream()
                .map(admin -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", admin.getId());
                    map.put("email", admin.getEmail());
                    map.put("fullName", admin.getFullName());
                    map.put("createdAt", admin.getCreatedAt());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> dashboardStats() {
        return ResponseEntity.ok(adminFacade.getDashboardStats());
    }

    @GetMapping("/applications")
    public ResponseEntity<PaginatedApplicationsResponse> getApplications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminFacade.getApplications(status, search, page, size));
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<ApplicationResponse> getApplication(@PathVariable Long id) {
        return ResponseEntity.ok(adminFacade.getApplicationById(id));
    }

    @PutMapping("/applications/{id}/review")
    public ResponseEntity<ApplicationResponse> reviewApplication(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(adminFacade.reviewApplication(id, request));
    }
}
