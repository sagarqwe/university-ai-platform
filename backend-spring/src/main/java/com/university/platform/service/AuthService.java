package com.university.platform.service;

import com.university.platform.dto.AuthDTOs;
import com.university.platform.model.User;
import com.university.platform.repository.UserRepository;
import com.university.platform.security.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service @Slf4j
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils, @Lazy AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Transactional
    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());

        User.Role role;
        try { role = User.Role.valueOf(request.getRole().toUpperCase()); }
        catch (Exception e) { role = User.Role.STUDENT; }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .profileComplete(false)
                .build();
        userRepository.save(user);
        log.info("New user registered: {} ({})", user.getEmail(), user.getRole());
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthDTOs.AuthResponse setupProfile(AuthDTOs.ProfileSetupRequest request, User user) {
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        user.setCourse(request.getCourse());
        user.setHostel(request.getHostel());
        user.setProfileComplete(true);
        userRepository.save(user);
        log.info("Profile completed for: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    private AuthDTOs.AuthResponse buildAuthResponse(User user) {
        return AuthDTOs.AuthResponse.builder()
                .token(jwtUtils.generateToken(user))
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .userId(user.getId())
                .profileComplete(Boolean.TRUE.equals(user.getProfileComplete()))
                .branch(user.getBranch())
                .year(user.getYear())
                .course(user.getCourse())
                .build();
    }
}
