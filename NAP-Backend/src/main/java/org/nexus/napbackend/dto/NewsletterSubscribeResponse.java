package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record NewsletterSubscribeResponse(
        Long id,
        String email,
        Boolean doubleOptIn,
        LocalDateTime createdAt
) {}
