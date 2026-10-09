package org.nexus.napbackend.repository;

import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.NewsletterSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterSubscriptionRepository extends JpaRepository<NewsletterSubscription, Long> {

    Optional<NewsletterSubscription> findByEmail(String email);

    Optional<NewsletterSubscription> findByTenantIdAndEmail(Long tenantId, String email);

    List<NewsletterSubscription> findAllByTenantId(Long tenantId);

    Optional<NewsletterSubscription> findByIdAndTenantId(Long id, Long tenantId);
}
