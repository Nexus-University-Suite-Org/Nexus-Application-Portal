package org.nexus.napbackend.controller;

import java.util.Map;
import org.nexus.napbackend.service.EmailJsSender;
import org.nexus.napbackend.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/otp")
public class OtpController {

    private final OtpService otpService;
    private final EmailJsSender emailJsSender;

    public OtpController(OtpService otpService, EmailJsSender emailJsSender) {
        this.otpService = otpService;
        this.emailJsSender = emailJsSender;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "Email is required"));
        }
        var otp = otpService.generateOtp(email, "APPLICATION_EMAIL");
        boolean sent = emailJsSender.sendOtp(email, otp.getCode(), 10);
        if (!sent) {
            return ResponseEntity.ok(Map.of("ok", true, "message", "Verification code generated (email delivery unavailable — check console for code)", "emailSent", false));
        }
        return ResponseEntity.ok(Map.of("ok", true, "message", "Verification code sent", "emailSent", true));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("otp");
        if (email == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "Email and OTP are required"));
        }
        try {
            OtpService.OtpVerificationResult result = otpService.verifyOtp(email, code, "APPLICATION_EMAIL");
            return ResponseEntity.ok(Map.of("ok", true, "verified", result.verified()));
        } catch (OtpService.OtpException e) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("ok", false);
            response.put("message", e.getMessage());
            response.put("error", e.getErrorCode());
            if (e.getRemainingAttempts() != null) {
                response.put("remainingAttempts", e.getRemainingAttempts());
            }
            return ResponseEntity.status(e.getStatusCode()).body(response);
        }
    }
}
