package org.nexus.napbackend.controller;

import jakarta.validation.Valid;
import java.util.Map;
import org.nexus.napbackend.dto.StudentLoginRequest;
import org.nexus.napbackend.dto.StudentLoginResponse;
import org.nexus.napbackend.facade.StudentAuthFacade;
import org.nexus.napbackend.service.IdentityGateway;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth/student")
public class StudentAuthController {

    private final StudentAuthFacade studentAuthFacade;

    public StudentAuthController(StudentAuthFacade studentAuthFacade) {
        this.studentAuthFacade = studentAuthFacade;
    }

    @PostMapping("/login")
    public ResponseEntity<StudentLoginResponse> login(@Valid @RequestBody StudentLoginRequest request) {
        return ResponseEntity.ok(studentAuthFacade.login(request.email(), request.password()));
    }

    @GetMapping("/me")
    public ResponseEntity<StudentLoginResponse> currentStudent(@AuthenticationPrincipal Jwt jwt) {
        var roles = jwt.getClaimAsStringList("roles");
        if (roles == null || roles.stream().noneMatch(role ->
                role.equals("STUDENT") || role.equals("APPLICANT"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Student access is required");
        }
        String email = jwt.getClaimAsString("email");
        if (jwt.getAudience() == null || !jwt.getAudience().contains(IdentityGateway.STUDENT_PORTAL_CLIENT)
                || !Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified"))
                || email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "A verified student identity is required");
        }
        return ResponseEntity.ok(studentAuthFacade.profileForSso(email));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "Email is required"));
        }
        // Always the same answer, whether or not the address exists.
        studentAuthFacade.requestPasswordReset(email);
        return ResponseEntity.ok(Map.of(
                "ok", true,
                "message", "If that address has an account, a reset link is on its way."));
    }
}
