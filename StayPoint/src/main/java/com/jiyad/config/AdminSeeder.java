package com.jiyad.config;

import com.jiyad.model.Role;
import com.jiyad.model.User;
import com.jiyad.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a single admin account on startup if one doesn't exist yet, so the
 * verification dashboard has a way in. Admins are never self-registered.
 * Credentials come from env (ADMIN_EMAIL / ADMIN_PASSWORD) with demo defaults.
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminSeeder(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       @Value("${ADMIN_EMAIL:admin@staypoint.local}") String adminEmail,
                       @Value("${ADMIN_PASSWORD:admin12345}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }
        User admin = new User(adminEmail, passwordEncoder.encode(adminPassword), Role.ROLE_ADMIN);
        userRepository.save(admin);
        log.info("Seeded admin account: {}", adminEmail);
    }
}
