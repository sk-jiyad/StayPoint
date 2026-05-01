package com.jiyad.dto;

import com.jiyad.model.Role;

public class AuthResponseDTO {

    private final String token;
    private final Long userId;
    private final String email;
    private final Role role;

    public AuthResponseDTO(String token, Long userId, String email, Role role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
}
