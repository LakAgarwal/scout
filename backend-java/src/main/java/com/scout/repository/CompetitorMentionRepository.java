package com.scout.repository;

import com.scout.model.CompetitorMention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CompetitorMentionRepository extends JpaRepository<CompetitorMention, UUID> {

    @Query("SELECT m.companyName, SUM(m.mentionCount) FROM CompetitorMention m " +
           "GROUP BY m.companyName")
    List<Object[]> getCompetitorShareOfVoice();

    @Query("SELECT a.industry, SUM(m.mentionCount) FROM CompetitorMention m JOIN m.article a " +
           "WHERE m.companyName = :companyName " +
           "GROUP BY a.industry")
    List<Object[]> getIndustryBreakdown(@Param("companyName") String companyName);

    @Query("SELECT s.sentiment, SUM(m.mentionCount) FROM CompetitorMention m JOIN m.article a JOIN a.sentimentScore s " +
           "WHERE m.companyName = :companyName " +
           "GROUP BY s.sentiment")
    List<Object[]> getSentimentBreakdown(@Param("companyName") String companyName);

    @Query("SELECT a.title, a.url, s.sentiment, m.mentionCount, m.contextSnippet, a.publishedDate " +
           "FROM CompetitorMention m JOIN m.article a LEFT JOIN a.sentimentScore s " +
           "WHERE m.companyName = :companyName " +
           "ORDER BY a.publishedDate DESC")
    List<Object[]> getCompetitorMentions(@Param("companyName") String companyName);
}
