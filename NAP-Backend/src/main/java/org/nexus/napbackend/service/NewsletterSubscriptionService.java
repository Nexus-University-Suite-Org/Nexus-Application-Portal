package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.NewsletterSubscription;
import org.nexus.napbackend.repository.NewsletterSubscriptionRepository;
import org.nexus.napbackend.tenancy.TenantContext;
import org.springframework.stereotype.Service;

@Service
public class NewsletterSubscriptionService {

    private final NewsletterSubscriptionRepository repository;

    public NewsletterSubscriptionService(NewsletterSubscriptionRepository repository) {
        this.repository = repository;
    }

    public NewsletterSubscription subscribe(String email) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Optional<NewsletterSubscription> existing = repository.findByTenantIdAndEmail(tenantId, email);
        if (existing.isPresent()) {
            return existing.get();
        }
        NewsletterSubscription sub = new NewsletterSubscription();
        sub.setTenantId(tenantId);
        sub.setEmail(email);
        sub.setDoubleOptIn(false);
        sub.setCreatedAt(LocalDateTime.now());
        return repository.save(sub);
    }

    public List<NewsletterSubscription> findAll() {
        return repository.findAllByTenantId(TenantContext.getCurrentTenantId());
    }

    public Optional<NewsletterSubscription> findById(Long id) {
        return repository.findByIdAndTenantId(id, TenantContext.getCurrentTenantId());
    }

    public void deleteById(Long id) {
        repository.findByIdAndTenantId(id, TenantContext.getCurrentTenantId())
                .ifPresent(repository::delete);
    }
}
