package org.nexus.napbackend.facade;

import jakarta.transaction.Transactional;
import java.util.List;
import org.nexus.napbackend.dto.NewsArticleRequest;
import org.nexus.napbackend.dto.NewsArticleResponse;
import org.nexus.napbackend.mapper.NewsArticleMapper;
import org.nexus.napbackend.model.NewsArticle;
import org.nexus.napbackend.service.NewsArticleService;
import org.springframework.stereotype.Component;

@Component
public class NewsArticleFacade {

    private final NewsArticleService service;

    public NewsArticleFacade(NewsArticleService service) {
        this.service = service;
    }

    @Transactional
    public NewsArticleResponse create(NewsArticleRequest request) {
        NewsArticle entity = NewsArticleMapper.toEntity(request);
        NewsArticle saved = service.create(entity);
        return NewsArticleMapper.toDto(saved);
    }

    @Transactional
    public NewsArticleResponse findById(Long id) {
        NewsArticle entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("News article not found"));
        return NewsArticleMapper.toDto(entity);
    }

    @Transactional
    public List<NewsArticleResponse> findAll() {
        return service.findAll().stream()
                .map(NewsArticleMapper::toDto)
                .toList();
    }

    @Transactional
    public List<NewsArticleResponse> findByCategory(String category) {
        return service.findByCategory(category).stream()
                .map(NewsArticleMapper::toDto)
                .toList();
    }

    @Transactional
    public NewsArticleResponse update(Long id, NewsArticleRequest request) {
        NewsArticle entity = service.findById(id)
                .orElseThrow(() -> new RuntimeException("News article not found"));
        NewsArticleMapper.updateEntity(entity, request);
        NewsArticle updated = service.update(id, entity);
        return NewsArticleMapper.toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        service.delete(id);
    }

    @Transactional
    public List<NewsArticleResponse> search(String query) {
        return service.search(query).stream()
                .map(NewsArticleMapper::toDto)
                .toList();
    }
}
