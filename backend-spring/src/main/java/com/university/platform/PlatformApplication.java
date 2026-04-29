package com.university.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * File: backend-spring/src/main/java/com/university/platform/PlatformApplication.java
 * Purpose: Spring Boot application entry point.
 * Run with: mvn spring-boot:run (from backend-spring directory)
 */
@SpringBootApplication
@EnableAsync
public class PlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(PlatformApplication.class, args);
    }
}
