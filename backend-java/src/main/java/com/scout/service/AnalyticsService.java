package com.scout.service;

import com.scout.model.Topic;
import com.scout.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private SentimentScoreRepository sentimentScoreRepository;

    @Autowired
    private KeywordRepository keywordRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private CompetitorMentionRepository competitorMentionRepository;

    @Autowired
    private ArticleRepository articleRepository;

    public List<Map<String, Object>> getSentimentSummary(String industry) {
        List<Object[]> results = sentimentScoreRepository.getSentimentSummary(
                (industry != null && !industry.isEmpty()) ? industry : null
        );

        long totalCount = results.stream().mapToLong(r -> ((Number) r[1]).longValue()).sum();
        List<Map<String, Object>> summaryList = new ArrayList<>();

        for (Object[] row : results) {
            String sentiment = (String) row[0];
            long count = ((Number) row[1]).longValue();
            double percentage = totalCount > 0 ? round((double) count / totalCount * 100, 2) : 0.0;

            Map<String, Object> item = new HashMap<>();
            item.put("sentiment", sentiment);
            item.put("count", count);
            item.put("percentage", percentage);
            summaryList.add(item);
        }

        return summaryList;
    }

    public List<Map<String, Object>> getSentimentTrend(int days) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        List<Object[]> results = sentimentScoreRepository.getSentimentTrend(cutoff);
        List<Map<String, Object>> trendList = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            // row[0] is date_group (java.sql.Date or similar)
            item.put("date", row[0].toString());
            item.put("positive", ((Number) row[1]).intValue());
            item.put("negative", ((Number) row[2]).intValue());
            item.put("neutral", ((Number) row[3]).intValue());
            trendList.add(item);
        }

        return trendList;
    }

    public List<Map<String, Object>> getTrendingKeywords(int days) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        Pageable limit20 = PageRequest.of(0, 20);
        List<Object[]> results = keywordRepository.getTrendingKeywords(cutoff, limit20);
        List<Map<String, Object>> kwList = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("keyword", row[0].toString());
            item.put("score", round(((Number) row[1]).doubleValue(), 2));
            kwList.add(item);
        }

        return kwList;
    }

    public List<Map<String, Object>> getTopTopics(int limit) {
        Pageable limitPage = PageRequest.of(0, limit);
        List<Topic> topics = topicRepository.findTopTopics(limitPage);
        return topics.stream().map(t -> {
            Map<String, Object> item = new HashMap<>();
            item.put("topic_name", t.getTopicName());
            item.put("frequency", t.getFrequency());
            item.put("date", t.getCreatedAt().toString());
            return item;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTopicVelocity(int days) {
        LocalDateTime cutoffCurrent = LocalDateTime.now().minusDays(days);
        LocalDateTime cutoffPrevious = LocalDateTime.now().minusDays(2 * days);

        List<Object[]> currentCounts = articleRepository.countArticlesByTopicSince(cutoffCurrent);
        List<Object[]> previousTotals = articleRepository.countArticlesByTopicSince(cutoffPrevious);

        Map<String, Long> currentMap = currentCounts.stream().collect(
                Collectors.toMap(r -> (String) r[0], r -> ((Number) r[1]).longValue())
        );

        Map<String, Long> previousTotalMap = previousTotals.stream().collect(
                Collectors.toMap(r -> (String) r[0], r -> ((Number) r[1]).longValue())
        );

        Set<String> allTopics = new HashSet<>();
        allTopics.addAll(currentMap.keySet());
        allTopics.addAll(previousTotalMap.keySet());

        List<Map<String, Object>> velocityList = new ArrayList<>();
        for (String topic : allTopics) {
            long currentCount = currentMap.getOrDefault(topic, 0L);
            long totalPrev = previousTotalMap.getOrDefault(topic, 0L);
            long previousCount = totalPrev - currentCount;
            if (previousCount < 0) previousCount = 0;

            double velocityPct = ((double) (currentCount - previousCount) / Math.max(previousCount, 1)) * 100;

            Map<String, Object> item = new HashMap<>();
            item.put("topic_name", topic);
            item.put("current_count", currentCount);
            item.put("previous_count", previousCount);
            item.put("velocity_pct", round(velocityPct, 2));
            velocityList.add(item);
        }

        velocityList.sort((a, b) -> Double.compare(
                ((Number) b.get("velocity_pct")).doubleValue(),
                ((Number) a.get("velocity_pct")).doubleValue()
        ));

        return velocityList;
    }

    public List<Map<String, Object>> getCompetitorSummaries() {
        List<Object[]> voiceResults = competitorMentionRepository.getCompetitorShareOfVoice();
        List<Map<String, Object>> summaries = new ArrayList<>();

        for (Object[] row : voiceResults) {
            String companyName = (String) row[0];
            long totalMentions = ((Number) row[1]).longValue();

            // Industry breakdown
            List<Object[]> indResults = competitorMentionRepository.getIndustryBreakdown(companyName);
            Map<String, Long> indBreakdown = indResults.stream().collect(
                    Collectors.toMap(r -> (String) r[0], r -> ((Number) r[1]).longValue())
            );

            // Sentiment breakdown
            List<Object[]> sentResults = competitorMentionRepository.getSentimentBreakdown(companyName);
            Map<String, Long> sentBreakdown = sentResults.stream().collect(
                    Collectors.toMap(r -> (String) r[0], r -> ((Number) r[1]).longValue())
            );

            Map<String, Object> summary = new HashMap<>();
            summary.put("company_name", companyName);
            summary.put("total_mentions", totalMentions);
            summary.put("industry_breakdown", indBreakdown);
            summary.put("sentiment_breakdown", sentBreakdown);
            summaries.add(summary);
        }

        // Sort descending by total mentions
        summaries.sort((a, b) -> Long.compare(
                ((Number) b.get("total_mentions")).longValue(),
                ((Number) a.get("total_mentions")).longValue()
        ));

        return summaries;
    }

    public List<Map<String, Object>> getCompetitorMentions(String companyName) {
        List<Object[]> results = competitorMentionRepository.getCompetitorMentions(companyName);
        List<Map<String, Object>> mentions = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> m = new HashMap<>();
            m.put("article_title", row[0]);
            m.put("article_url", row[1]);
            m.put("sentiment", row[2] != null ? row[2] : "neutral");
            m.put("mention_count", ((Number) row[3]).intValue());
            m.put("context_snippet", row[4] != null ? row[4] : "");
            m.put("published_date", row[5].toString());
            mentions.add(m);
        }

        return mentions;
    }

    private double round(double value, int places) {
        if (Double.isNaN(value) || Double.isInfinite(value)) return 0.0;
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
