package org.nexus.napbackend.dto;

import java.time.LocalDateTime;

public record NewsletterSubscriptionResponse(
        Long id,
        Long tenantId,
        String email,
        Boolean doubleOptIn,
        LocalDateTime createdAt
) {}
