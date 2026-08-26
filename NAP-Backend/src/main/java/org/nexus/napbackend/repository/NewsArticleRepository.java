package org.nexus.napbackend.repository;

import java.util.List;
import org.nexus.napbackend.model.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {

    List<NewsArticle> findByPublishedTrueOrderByPublishedAtDesc();
}
