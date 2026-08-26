package org.nexus.napbackend.dto;

public record AdminLoginResponse(
        String token,
        String email,
        String fullName
) {
}
