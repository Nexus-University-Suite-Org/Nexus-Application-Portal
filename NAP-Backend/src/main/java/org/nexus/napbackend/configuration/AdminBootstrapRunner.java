package org.nexus.napbackend.configuration;

import org.nexus.napbackend.model.Admin;
import org.nexus.napbackend.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Bootstraps the platform super-admin account.
 *
 * <p>There is deliberately no registration page for the first account - anyone
 * who could create one would already be the platform owner. The owner is instead
 * provisioned from {@code SUPER_ADMIN_EMAIL} / {@code SUPER_ADMIN_PASSWORD} on
 * first startup. The runner is idempotent: once a super-admin exists it does
 * nothing, so the environment variables can stay set without creating fresh
 * accounts on every redeploy.
 */
@Component
public class AdminBootstrapRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String fullName;

    public AdminBootstrapRunner(AdminRepository adminRepository,
                                PasswordEncoder passwordEncoder,
                                @Value("${nap.super-admin.email:}") String email,
                                @Value("${nap.super-admin.password:}") String password,
                                @Value("${nap.super-admin.full-name:Platform Administrator}") String fullName) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email == null ? "" : email.trim();
        this.password = password == null ? "" : password;
        this.fullName = fullName == null ? "Platform Administrator" : fullName.trim();
    }

    @Override
    public void run(String... args) {
        if (adminRepository.findFirstByRoleOrderByIdAsc("SUPER_ADMIN").isPresent()) {
            return;
        }

        if (email.isBlank() || password.isBlank()) {
            log.warn(
                    "No SUPER_ADMIN account exists and SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD "
                    + "are not set. Set both on the backend to create the platform owner.");
            return;
        }

        if (password.length() < 8) {
            log.warn("SUPER_ADMIN_PASSWORD is shorter than 8 characters; not creating an account.");
            return;
        }

        if (adminRepository.existsByEmail(email)) {
            log.warn("An admin with email {} already exists; not creating a super-admin.", email);
            return;
        }

        Admin admin = new Admin();
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setFullName(fullName);
        admin.setRole("SUPER_ADMIN");
        admin.setCreatedAt(java.time.LocalDateTime.now());
        adminRepository.save(admin);
        log.info("Created platform super-admin {}", email);
    }
}