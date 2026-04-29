package com.university.platform.dto;

import lombok.Builder;
import lombok.Data;

public class AuthDTOs {

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String role; // STUDENT or ADMIN
    }

    @Data
    public static class ProfileSetupRequest {
        private String branch;
        private Integer year;
        private String course;
        private Boolean hostel;
    }

    @Data @Builder
    public static class AuthResponse {
        private String token;
        private String email;
        private String name;
        private String role;
        private Long userId;
        private Boolean profileComplete;
        private String branch;
        private Integer year;
        private String course;
    }

    @Data @Builder
    public static class UserProfileDTO {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String branch;
        private Integer year;
        private String course;
        private Boolean hostel;
        private Boolean profileComplete;
    }
}
