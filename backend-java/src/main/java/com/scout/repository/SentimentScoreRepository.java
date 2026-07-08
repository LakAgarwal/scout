package com.scout.repository;

import com.scout.model.SentimentScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface SentimentScoreRepository extends JpaRepository<SentimentScore, UUID> {

    @Query("SELECT s.sentiment, COUNT(s.id) FROM SentimentScore s JOIN s.article a " +
           "WHERE (:industry IS NULL OR a.industry = :industry) " +
           "GROUP BY s.sentiment")
    List<Object[]> getSentimentSummary(@Param("industry") String industry);

    @Query(value = "SELECT CAST(DATE_TRUNC('day', a.published_date) AS DATE) as date_group, " +
                   "SUM(CASE WHEN s.sentiment = 'positive' THEN 1 ELSE 0 END) as positive, " +
                   "SUM(CASE WHEN s.sentiment = 'negative' THEN 1 ELSE 0 END) as negative, " +
                   "SUM(CASE WHEN s.sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral " +
                   "FROM articles a JOIN sentiment_scores s ON a.id = s.article_id " +
                   "WHERE a.published_date >= :cutoffDate " +
                   "GROUP BY date_group ORDER BY date_group", nativeQuery = true)
    List<Object[]> getSentimentTrend(@Param("cutoffDate") LocalDateTime cutoffDate);
}
