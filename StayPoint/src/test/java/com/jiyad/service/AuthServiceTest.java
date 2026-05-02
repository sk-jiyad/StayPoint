package com.jiyad.service;

import com.jiyad.dto.AuthResponseDTO;
import com.jiyad.dto.LoginRequestDTO;
import com.jiyad.dto.RegisterRequestDTO;
import com.jiyad.model.Role;
import com.jiyad.model.User;
import com.jiyad.repository.UserRepository;
import com.jiyad.security.AuthUserPrincipal;
import com.jiyad.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks private AuthService authService;

    private RegisterRequestDTO validRegisterDto() {
        RegisterRequestDTO dto = new RegisterRequestDTO();
        dto.setEmail("test@example.com");
        dto.setPassword("SecurePass123!");
        dto.setRole(Role.ROLE_OWNER);
        return dto;
    }

    private LoginRequestDTO validLoginDto() {
        LoginRequestDTO dto = new LoginRequestDTO();
        dto.setEmail("test@example.com");
        dto.setPassword("SecurePass123!");
        return dto;
    }

    @Test
    void register_whenEmailNotExists_savesHashedPasswordAndReturnsToken() {
        RegisterRequestDTO dto = validRegisterDto();
        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(dto.getPassword())).thenReturn("hashed_pw");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtUtil.generateToken(anyLong(), anyString(), any(Role.class)))
                .thenReturn("fake.jwt.token");

        AuthResponseDTO result = authService.register(dto);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("hashed_pw", savedUser.getPasswordHash(),
                "Password must be stored hashed, never plaintext");
        assertNotEquals(dto.getPassword(), savedUser.getPasswordHash(),
                "Stored password must not match plaintext input");
        assertEquals(dto.getEmail(), savedUser.getEmail());
        assertEquals(dto.getRole(), savedUser.getRole());

        assertEquals("fake.jwt.token", result.getToken());
        assertEquals(1L, result.getUserId());
        assertEquals(dto.getEmail(), result.getEmail());
        assertEquals(dto.getRole(), result.getRole());
    }

    @Test
    void register_whenEmailExists_throwsIllegalArgumentException() {
        RegisterRequestDTO dto = validRegisterDto();
        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.register(dto));
        assertEquals("Email already registered", ex.getMessage());

        verify(userRepository, never()).save(any());
        verify(jwtUtil, never()).generateToken(any(), any(), any());
    }

    @Test
    void register_callsPasswordEncoderExactlyOnce() {
        RegisterRequestDTO dto = validRegisterDto();
        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtUtil.generateToken(anyLong(), anyString(), any(Role.class))).thenReturn("token");

        authService.register(dto);

        verify(passwordEncoder, times(1)).encode(dto.getPassword());
    }

    @Test
    void login_withValidCredentials_returnsToken() {
        LoginRequestDTO dto = validLoginDto();
        AuthUserPrincipal principal =
                new AuthUserPrincipal(7L, dto.getEmail(), Role.ROLE_OWNER);
        UsernamePasswordAuthenticationToken authResult =
                new UsernamePasswordAuthenticationToken(
                        principal, null, principal.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(authResult);
        when(jwtUtil.generateToken(7L, dto.getEmail(), Role.ROLE_OWNER))
                .thenReturn("issued.jwt.token");

        AuthResponseDTO result = authService.login(dto);

        verify(authenticationManager).authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword()));
        assertEquals("issued.jwt.token", result.getToken());
        assertEquals(7L, result.getUserId());
        assertEquals(dto.getEmail(), result.getEmail());
        assertEquals(Role.ROLE_OWNER, result.getRole());
    }

    @Test
    void login_whenAuthManagerRejects_throwsBadCredentials() {
        LoginRequestDTO dto = validLoginDto();
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad"));

        BadCredentialsException ex = assertThrows(BadCredentialsException.class,
                () -> authService.login(dto));
        assertEquals("Invalid email or password", ex.getMessage(),
                "Error message should not leak whether email exists");

        verify(jwtUtil, never()).generateToken(any(), any(), any());
    }
}