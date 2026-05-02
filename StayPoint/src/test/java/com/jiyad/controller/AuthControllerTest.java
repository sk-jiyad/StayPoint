package com.jiyad.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jiyad.dto.AuthResponseDTO;
import com.jiyad.dto.LoginRequestDTO;
import com.jiyad.dto.RegisterRequestDTO;
import com.jiyad.model.Role;
import com.jiyad.security.JwtAuthFilter;
import com.jiyad.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private AuthService authService;
    @MockitoBean private JwtAuthFilter jwtAuthFilter;

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
    void register_withValidBody_returns201WithToken() throws Exception {
        AuthResponseDTO response = new AuthResponseDTO(
                "issued.jwt.token", 1L, "test@example.com", Role.ROLE_OWNER);
        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterDto())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("issued.jwt.token"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("ROLE_OWNER"));
    }

    @Test
    void register_withInvalidEmail_returns400() throws Exception {
        RegisterRequestDTO dto = validRegisterDto();
        dto.setEmail("not-an-email");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    void register_withShortPassword_returns400() throws Exception {
        RegisterRequestDTO dto = validRegisterDto();
        dto.setPassword("short"); // < 8 chars

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void register_withMissingRole_returns400() throws Exception {
        String json = """
            {"email":"test@example.com","password":"SecurePass123!"}
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.role").exists());
    }

    @Test
    void register_whenEmailDuplicate_returns400() throws Exception {
        when(authService.register(any(RegisterRequestDTO.class)))
                .thenThrow(new IllegalArgumentException("Email already registered"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterDto())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    @Test
    void login_withValidCredentials_returns200WithToken() throws Exception {
        AuthResponseDTO response = new AuthResponseDTO(
                "issued.jwt.token", 7L, "test@example.com", Role.ROLE_OWNER);
        when(authService.login(any(LoginRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginDto())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("issued.jwt.token"))
                .andExpect(jsonPath("$.userId").value(7));
    }

    @Test
    void login_withInvalidCredentials_returns401() throws Exception {
        when(authService.login(any(LoginRequestDTO.class)))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginDto())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void login_withMalformedEmail_returns400() throws Exception {
        LoginRequestDTO dto = validLoginDto();
        dto.setEmail("not-an-email");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    void login_withBlankPassword_returns400() throws Exception {
        LoginRequestDTO dto = validLoginDto();
        dto.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
    }
}