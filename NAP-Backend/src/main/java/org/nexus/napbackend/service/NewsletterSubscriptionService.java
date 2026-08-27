package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.NewsletterSubscription;
import org.nexus.napbackend.repository.NewsletterSubscriptionRepository;
import org.springframework.stereotype.Service;

@Service
public class NewsletterSubscriptionService {

    private final NewsletterSubscriptionRepository repository;

    public NewsletterSubscriptionService(NewsletterSubscriptionRepository repository) {
        this.repository = repository;
    }

    public NewsletterSubscription subscribe(String email) {
        Optional<NewsletterSubscription> existing = repository.findByEmail(email);
        if (existing.isPresent()) {
            return existing.get();
        }
        NewsletterSubscription sub = new NewsletterSubscription();
        sub.setTenantId(1L);
        sub.setEmail(email);
        sub.setDoubleOptIn(false);
        sub.setCreatedAt(LocalDateTime.now());
        return repository.save(sub);
    }

    public List<NewsletterSubscription> findAll() {
        return repository.findAll();
    }

    public Optional<NewsletterSubscription> findById(Long id) {
        return repository.findById(id);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
