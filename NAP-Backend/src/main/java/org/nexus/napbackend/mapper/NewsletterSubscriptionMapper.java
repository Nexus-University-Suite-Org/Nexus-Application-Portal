package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.NewsletterSubscribeResponse;
import org.nexus.napbackend.model.NewsletterSubscription;

public final class NewsletterSubscriptionMapper {

    private NewsletterSubscriptionMapper() {
    }

    public static NewsletterSubscribeResponse toDto(NewsletterSubscription entity) {
        return new NewsletterSubscribeResponse(
                entity.getId(),
                entity.getEmail(),
                entity.getDoubleOptIn(),
                entity.getCreatedAt()
        );
    }
}
