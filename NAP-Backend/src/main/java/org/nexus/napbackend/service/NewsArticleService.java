package org.nexus.napbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.nexus.napbackend.model.NewsArticle;
import org.nexus.napbackend.repository.NewsArticleRepository;
import org.springframework.stereotype.Service;

@Service
public class NewsArticleService {

    private final NewsArticleRepository repository;

    public NewsArticleService(NewsArticleRepository repository) {
        this.repository = repository;
    }

    public NewsArticle create(NewsArticle entity) {
        entity.setSlug(generateSlug(entity.getTitle()));
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        if (entity.getPublished() && entity.getPublishedAt() == null) {
            entity.setPublishedAt(LocalDateTime.now());
        }
        return repository.save(entity);
    }

    public Optional<NewsArticle> findById(Long id) {
        return repository.findById(id);
    }

    public List<NewsArticle> findAll() {
        return repository.findAll();
    }

    public List<NewsArticle> findByCategory(String category) {
        if (category == null || category.isEmpty()) {
            return repository.findAll();
        }
        return repository.findAll().stream()
                .filter(a -> category.equalsIgnoreCase(a.getCategory()))
                .toList();
    }

    public NewsArticle update(Long id, NewsArticle entity) {
        entity.setId(id);
        entity.setUpdatedAt(LocalDateTime.now());
        if (entity.getPublished() && entity.getPublishedAt() == null) {
            entity.setPublishedAt(LocalDateTime.now());
        }
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<NewsArticle> search(String query) {
        String lower = query.toLowerCase();
        return repository.findAll().stream()
                .filter(a -> (a.getTitle() != null && a.getTitle().toLowerCase().contains(lower))
                        || (a.getExcerpt() != null && a.getExcerpt().toLowerCase().contains(lower))
                        || (a.getContent() != null && a.getContent().toLowerCase().contains(lower)))
                .toList();
    }

    private String generateSlug(String title) {
        if (title == null) return "";
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
