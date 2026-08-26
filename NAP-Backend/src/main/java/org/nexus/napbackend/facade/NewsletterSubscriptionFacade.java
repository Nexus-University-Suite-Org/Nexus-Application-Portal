package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import org.nexus.napbackend.dto.NewsletterSubscribeRequest;
import org.nexus.napbackend.dto.NewsletterSubscribeResponse;
import org.nexus.napbackend.mapper.NewsletterSubscriptionMapper;
import org.nexus.napbackend.model.NewsletterSubscription;
import org.nexus.napbackend.service.NewsletterSubscriptionService;
import org.springframework.stereotype.Component;

@Component
public class NewsletterSubscriptionFacade {

    private final NewsletterSubscriptionService service;

    public NewsletterSubscriptionFacade(NewsletterSubscriptionService service) {
        this.service = service;
    }

    @Transactional
    public NewsletterSubscribeResponse subscribe(NewsletterSubscribeRequest request) {
        NewsletterSubscription sub = service.subscribe(request.email());
        return NewsletterSubscriptionMapper.toDto(sub);
    }
}
