package com.university.platform.config;

import com.university.platform.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;

/**
 * File: backend-spring/src/main/java/com/university/platform/config/UserDetailsConfig.java
 *
 * Purpose: Explicitly exposes AuthService as the UserDetailsService bean.
 *
 * Why needed: SecurityConfig injects UserDetailsService by interface type.
 * Without this explicit @Bean, Spring may find multiple candidates if additional
 * services are added later, causing "expected single matching bean" startup failure.
 * This makes the wiring unambiguous and follows the principle of explicit over implicit.
 *
 * Connects to: SecurityConfig (DaoAuthenticationProvider uses this bean)
 */
@Configuration
@RequiredArgsConstructor
public class UserDetailsConfig {

    private final AuthService authService;

    @Bean
    public UserDetailsService userDetailsService() {
        return authService;
    }
}
