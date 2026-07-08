package com.scout.repository;

import com.scout.model.Keyword;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface KeywordRepository extends JpaRepository<Keyword, UUID> {

    @Query("SELECT k.keyword, AVG(k.score) as avg_score FROM Keyword k JOIN k.article a " +
           "WHERE a.publishedDate >= :cutoffDate " +
           "GROUP BY k.keyword " +
           "ORDER BY avg_score DESC")
    List<Object[]> getTrendingKeywords(@Param("cutoffDate") LocalDateTime cutoffDate, Pageable pageable);
}
