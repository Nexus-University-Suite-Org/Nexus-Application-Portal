package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import org.nexus.napbackend.model.OtpCode;
import org.nexus.napbackend.repository.OtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private static final Long DEMO_TENANT_ID = 1L;
    private static final int OTP_LENGTH = 4;
    private static final int MAX_ATTEMPTS = 5;
    private static final int COOLDOWN_SECONDS = 60;
    private static final int EXPIRY_MINUTES = 10;

    private final OtpRepository repository;
    private final Random random = new Random();

    public OtpService(OtpRepository repository) {
        this.repository = repository;
    }

    public OtpCode generateOtp(String email, String purpose) {
        Optional<OtpCode> existing = repository.findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose);
        if (existing.isPresent()) {
            OtpCode lastOtp = existing.get();
            if (lastOtp.getCreatedAt().plusSeconds(COOLDOWN_SECONDS).isAfter(LocalDateTime.now())) {
                throw new OtpException("COOLDOWN", "Please wait before requesting a new code", 429);
            }
        }

        String code = String.format("%0" + OTP_LENGTH + "d", random.nextInt(10000));
        log.info("Generated OTP={} for email={}", code, email);

        OtpCode otp = new OtpCode();
        otp.setTenantId(DEMO_TENANT_ID);
        otp.setEmail(email);
        otp.setCode(code);
        otp.setPurpose(purpose);
        otp.setUsed(false);
        otp.setAttempts(0);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        otp.setCreatedAt(LocalDateTime.now());
        return repository.save(otp);
    }

    public OtpVerificationResult verifyOtp(String email, String code, String purpose) {
        Optional<OtpCode> optionalOtp = repository.findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose);

        if (optionalOtp.isEmpty()) {
            throw new OtpException("NOT_FOUND", "No active OTP found for this email", 404);
        }

        OtpCode otp = optionalOtp.get();

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otp.setUsed(true);
            repository.save(otp);
            throw new OtpException("EXPIRED", "OTP has expired", 410);
        }

        if (otp.getAttempts() >= MAX_ATTEMPTS) {
            otp.setUsed(true);
            repository.save(otp);
            throw new OtpException("MAX_ATTEMPTS", "Maximum verification attempts exceeded", 403);
        }

        otp.setAttempts(otp.getAttempts() + 1);

        if (!otp.getCode().equals(code)) {
            repository.save(otp);
            int remaining = MAX_ATTEMPTS - otp.getAttempts();
            throw new OtpException("WRONG_CODE", "Invalid verification code", 401, remaining);
        }

        otp.setUsed(true);
        repository.save(otp);
        return new OtpVerificationResult(true, "Verification successful");
    }

    public record OtpVerificationResult(boolean verified, String message) {
    }

    public static class OtpException extends RuntimeException {
        private final String errorCode;
        private final int statusCode;
        private final Integer remainingAttempts;

        public OtpException(String errorCode, String message, int statusCode) {
            super(message);
            this.errorCode = errorCode;
            this.statusCode = statusCode;
            this.remainingAttempts = null;
        }

        public OtpException(String errorCode, String message, int statusCode, Integer remainingAttempts) {
            super(message);
            this.errorCode = errorCode;
            this.statusCode = statusCode;
            this.remainingAttempts = remainingAttempts;
        }

        public String getErrorCode() { return errorCode; }
        public int getStatusCode() { return statusCode; }
        public Integer getRemainingAttempts() { return remainingAttempts; }
    }
}
