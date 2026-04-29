package com.university.platform.controller;

import com.university.platform.dto.AuthDTOs;
import com.university.platform.model.User;
import com.university.platform.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthDTOs.AuthResponse> login(@RequestBody AuthDTOs.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDTOs.AuthResponse> register(@RequestBody AuthDTOs.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/profile-setup")
    public ResponseEntity<AuthDTOs.AuthResponse> profileSetup(
            @RequestBody AuthDTOs.ProfileSetupRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.setupProfile(request, user));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthDTOs.UserProfileDTO> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(AuthDTOs.UserProfileDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .branch(user.getBranch())
                .year(user.getYear())
                .course(user.getCourse())
                .hostel(user.getHostel())
                .profileComplete(user.getProfileComplete())
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }
}
