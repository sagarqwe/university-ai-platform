package com.university.platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * File: backend-spring/src/test/java/com/university/platform/PlatformApplicationTests.java
 * Purpose: Smoke test — verifies the Spring context loads without errors.
 * Run with: mvn test
 * Uses test profile (H2 in-memory DB) to avoid needing PostgreSQL.
 */
@SpringBootTest
@ActiveProfiles("test")
class PlatformApplicationTests {

    @Test
    void contextLoads() {
        // If this passes, all beans wired correctly
    }
}
