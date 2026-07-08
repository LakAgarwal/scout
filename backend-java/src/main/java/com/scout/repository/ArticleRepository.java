package com.scout.repository;

import com.scout.model.Article;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ArticleRepository extends JpaRepository<Article, UUID> {

    @Query("SELECT a FROM Article a WHERE " +
           "(:industry IS NULL OR a.industry = :industry) AND " +
           "(:topic IS NULL OR a.topicName = :topic) AND " +
           "(:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Article> findArticlesWithFilters(
            @Param("search") String search,
            @Param("industry") String industry,
            @Param("topic") String topic,
            Pageable pageable
    );

    boolean existsByUrl(String url);

    Article findByUrl(String url);

    @Query("SELECT a.topicName, COUNT(a.id) FROM Article a " +
           "WHERE a.publishedDate >= :cutoffDate " +
           "AND a.topicName IS NOT NULL " +
           "AND a.topicName != 'Outliers' " +
           "GROUP BY a.topicName")
    List<Object[]> countArticlesByTopicSince(@Param("cutoffDate") LocalDateTime cutoffDate);
}
