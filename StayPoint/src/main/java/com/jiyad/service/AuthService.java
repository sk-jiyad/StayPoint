package com.jiyad.service;

import com.jiyad.dto.AuthResponseDTO;
import com.jiyad.dto.LoginRequestDTO;
import com.jiyad.dto.RegisterRequestDTO;
import com.jiyad.model.User;
import com.jiyad.repository.UserRepository;
import com.jiyad.security.AuthUserPrincipal;
import com.jiyad.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponseDTO register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        // Intentional simplification: clients self-select ROLE_USER vs ROLE_OWNER so the
        // demo can exercise both paths. Production would gate OWNER on email verification
        // or admin approval. See README "Design Decisions".
        User user = new User(
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword()),
                dto.getRole());
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponseDTO(token, user.getId(), user.getEmail(), user.getRole());
    }

    public AuthResponseDTO login(LoginRequestDTO dto) {
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword()));
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }
        AuthUserPrincipal principal = (AuthUserPrincipal) auth.getPrincipal();

        String token = jwtUtil.generateToken(
                principal.getId(), principal.getUsername(), principal.getRole());
        return new AuthResponseDTO(
                token, principal.getId(), principal.getUsername(), principal.getRole());
    }
}