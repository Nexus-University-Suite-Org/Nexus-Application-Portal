package org.nexus.napbackend.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import org.nexus.napbackend.model.OtpCode;
import org.nexus.napbackend.service.EmailJsSender;
import org.nexus.napbackend.service.OtpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/otp")
public class OtpController {

    private static final Logger log = LoggerFactory.getLogger(OtpController.class);
    private static final String PURPOSE = "APPLICATION_EMAIL";

    private final OtpService otpService;
    private final EmailJsSender emailJsSender;
    private final boolean exposeCode;

    public OtpController(
            OtpService otpService,
            EmailJsSender emailJsSender,
            @Value("${nap.otp.expose-code:false}") boolean exposeCode) {
        this.otpService = otpService;
        this.emailJsSender = emailJsSender;
        this.exposeCode = exposeCode;
    }

    /** OTP rows are looked up by exact address, so normalise case and padding. */
    private static String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private static Map<String, Object> errorBody(OtpService.OtpException e) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("ok", false);
        response.put("message", e.getMessage());
        response.put("error", e.getErrorCode());
        if (e.getRemainingAttempts() != null) {
            response.put("remainingAttempts", e.getRemainingAttempts());
        }
        return response;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> body) {
        String email = normalize(body.get("email"));
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("ok", false, "message", "Email is required", "error", "EMAIL_REQUIRED"));
        }

        OtpCode otp;
        try {
            otp = otpService.generateOtp(email, PURPOSE);
        } catch (OtpService.OtpException e) {
            // Resend cooldown and any other generation rule the service enforces.
            return ResponseEntity.status(e.getStatusCode()).body(errorBody(e));
        }

        // Delivered synchronously so that `emailSent` reflects reality. The
        // previous fire-and-forget thread reported success before the mail was
        // even attempted and only logged failures, leaving the applicant waiting
        // on a message that was never sent. sendOtp() already applies its own
        // HTTP timeout and reports every failure as `false`.
        boolean emailSent = emailJsSender.sendOtp(email, otp.getCode(), 10);
        if (!emailSent) {
            log.warn("OTP email not delivered for {}", email);
        }

        Map<String, Object> popup = new LinkedHashMap<>();
        popup.put("title", "Your Verification Code");
        popup.put("expiryMinutes", 10);
        popup.put("instructions",
                "Use this code to verify your identity. If you did not request this, please ignore this message.");
        if (exposeCode) {
            // Developer convenience only. Guarded by NAP_OTP_EXPOSE_CODE, which
            // must remain false on any deployed environment.
            popup.put("code", otp.getCode());
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("ok", true);
        response.put("emailSent", emailSent);
        response.put("popup", popup);
        response.put("message", emailSent
                ? "Verification code sent to " + email
                : "We could not send the verification code. Please try again.");
        if (!emailSent) {
            response.put("error", "OTP_DELIVERY_FAILED");
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> body) {
        String email = normalize(body.get("email"));
        String code = body.get("otp") == null ? null : body.get("otp").trim();
        if (email == null || email.isBlank() || code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("ok", false, "message", "Email and OTP are required", "error", "OTP_REQUIRED"));
        }
        try {
            OtpService.OtpVerificationResult result = otpService.verifyOtp(email, code, PURPOSE);
            return ResponseEntity.ok(Map.of(
                    "ok", true,
                    "verified", result.verified(),
                    "message", result.message()));
        } catch (OtpService.OtpException e) {
            return ResponseEntity.status(e.getStatusCode()).body(errorBody(e));
        }
    }
}
