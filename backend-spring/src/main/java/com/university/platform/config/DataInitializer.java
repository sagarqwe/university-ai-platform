package com.university.platform.config;

import com.university.platform.model.User;
import com.university.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * File: backend-spring/src/main/java/com/university/platform/config/DataInitializer.java
 * Purpose: Seeds the database with default admin and student users on first run.
 * Credentials:
 *   Admin:   admin@university.edu / admin123
 *   Student: student@university.edu / student123
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfNotExists(
                "Admin User",
                "admin@university.edu",
                "admin123",
                User.Role.ADMIN
        );
        createUserIfNotExists(
                "Student Demo",
                "student@university.edu",
                "student123",
                User.Role.STUDENT
        );
        log.info("Default users initialized.");
    }

    private void createUserIfNotExists(String name, String email, String password, User.Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .build();
            userRepository.save(user);
            log.info("Created user: {} ({})", email, role);
        }
    }
}
