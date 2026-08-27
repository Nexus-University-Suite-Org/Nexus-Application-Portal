package org.nexus.napbackend.mapper;

import org.nexus.napbackend.dto.NewsArticleRequest;
import org.nexus.napbackend.dto.NewsArticleResponse;
import org.nexus.napbackend.model.NewsArticle;

public final class NewsArticleMapper {

    private NewsArticleMapper() {}

    public static NewsArticle toEntity(NewsArticleRequest request) {
        NewsArticle entity = new NewsArticle();
        entity.setTitle(request.title());
        entity.setExcerpt(request.excerpt());
        entity.setContent(request.content());
        entity.setCategory(request.category());
        entity.setImageUrl(request.imageUrl());
        entity.setFeatured(request.featured() != null ? request.featured() : false);
        entity.setPublished(request.published() != null ? request.published() : false);
        return entity;
    }

    public static NewsArticleResponse toDto(NewsArticle entity) {
        return new NewsArticleResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getSlug(),
                entity.getExcerpt(),
                entity.getContent(),
                entity.getCategory(),
                entity.getImageUrl(),
                entity.getFeatured(),
                entity.getPublished(),
                entity.getPublishedAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static void updateEntity(NewsArticle entity, NewsArticleRequest request) {
        entity.setTitle(request.title());
        entity.setExcerpt(request.excerpt());
        entity.setContent(request.content());
        entity.setCategory(request.category());
        entity.setImageUrl(request.imageUrl());
        entity.setFeatured(request.featured() != null ? request.featured() : entity.getFeatured());
        entity.setPublished(request.published() != null ? request.published() : entity.getPublished());
    }
}
