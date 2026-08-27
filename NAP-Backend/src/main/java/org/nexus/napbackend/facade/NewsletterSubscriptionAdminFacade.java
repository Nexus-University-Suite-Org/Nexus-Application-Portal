package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.NewsletterSubscriptionResponse;
import org.nexus.napbackend.mapper.NewsletterSubscriptionMapper;
import org.nexus.napbackend.model.NewsletterSubscription;
import org.nexus.napbackend.service.NewsletterSubscriptionService;
import org.springframework.stereotype.Component;

@Component
public class NewsletterSubscriptionAdminFacade {

    private final NewsletterSubscriptionService service;

    public NewsletterSubscriptionAdminFacade(NewsletterSubscriptionService service) {
        this.service = service;
    }

    @Transactional
    public List<NewsletterSubscriptionResponse> findAll() {
        return service.findAll().stream()
                .map(NewsletterSubscriptionMapper::toAdminDto)
                .toList();
    }

    @Transactional
    public NewsletterSubscriptionResponse findById(Long id) {
        NewsletterSubscription entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Newsletter subscription not found"));
        return NewsletterSubscriptionMapper.toAdminDto(entity);
    }

    @Transactional
    public void delete(Long id) {
        service.deleteById(id);
    }
}
