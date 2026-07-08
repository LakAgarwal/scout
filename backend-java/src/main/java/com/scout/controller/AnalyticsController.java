package com.scout.controller;

import com.scout.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/sentiment")
    public List<Map<String, Object>> getSentimentSummary(
            @RequestParam(name = "industry", required = false) String industry
    ) {
        return analyticsService.getSentimentSummary(industry);
    }

    @GetMapping("/sentiment-trend")
    public List<Map<String, Object>> getSentimentTrend(
            @RequestParam(name = "days", defaultValue = "30") int days
    ) {
        return analyticsService.getSentimentTrend(days);
    }

    @GetMapping("/keywords")
    public List<Map<String, Object>> getTrendingKeywords(
            @RequestParam(name = "days", defaultValue = "7") int days
    ) {
        return analyticsService.getTrendingKeywords(days);
    }

    @GetMapping("/topics")
    public List<Map<String, Object>> getTopTopics(
            @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        return analyticsService.getTopTopics(limit);
    }

    @GetMapping("/topics/velocity")
    public List<Map<String, Object>> getTopicVelocity(
            @RequestParam(name = "days", defaultValue = "7") int days
    ) {
        return analyticsService.getTopicVelocity(days);
    }

    @GetMapping("/competitors")
    public List<Map<String, Object>> getCompetitorSummaries() {
        return analyticsService.getCompetitorSummaries();
    }

    @GetMapping("/competitors/{company_name}")
    public List<Map<String, Object>> getCompetitorMentions(@PathVariable("company_name") String companyName) {
        return analyticsService.getCompetitorMentions(companyName);
    }
}
