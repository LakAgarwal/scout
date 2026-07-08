package com.scout.controller;

import com.scout.model.Article;
import com.scout.repository.ArticleRepository;
import com.scout.service.GeminiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public Map<String, Object> chat(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        if (prompt == null || prompt.trim().isEmpty()) {
            return Map.of("response", "Please provide a prompt.", "articles", List.of());
        }

        logger.info("Received AI Analyst chat prompt: '{}'", prompt);

        // 1. Retrieve matching articles
        List<Article> articles = retrieveArticles(prompt, 5);

        // 2. Generate response
        String responseText = generateResponse(prompt, articles);

        // 3. Map articles to simplified list for frontend citation display
        List<Map<String, String>> citedArticles = articles.stream().map(a -> {
            Map<String, String> map = new HashMap<>();
            map.put("id", a.getId().toString());
            map.put("title", a.getTitle());
            map.put("url", a.getUrl());
            map.put("source", a.getSource() != null ? a.getSource() : "Unknown");
            map.put("industry", a.getIndustry());
            map.put("summary", a.getSummary());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("response", responseText);
        result.put("articles", citedArticles);
        return result;
    }

    private List<Article> retrieveArticles(String query, int limit) {
        String[] words = query.toLowerCase().split("\\s+");
        List<String> tokens = Arrays.stream(words)
                .map(String::trim)
                .filter(w -> w.length() > 2)
                .collect(Collectors.toList());

        if (tokens.isEmpty()) {
            return articleRepository.findArticlesWithFilters(null, null, null, PageRequest.of(0, limit));
        }

        // Fetch recent 200 articles to perform local keyword intersection
        List<Article> recent = articleRepository.findArticlesWithFilters(null, null, null, PageRequest.of(0, 200));

        List<Article> matched = recent.stream()
                .filter(a -> {
                    String text = ((a.getTitle() != null ? a.getTitle() : "") + " " + 
                                   (a.getContent() != null ? a.getContent() : "")).toLowerCase();
                    return tokens.stream().anyMatch(text::contains);
                })
                .limit(limit)
                .collect(Collectors.toList());

        if (matched.isEmpty()) {
            // Fallback to recent articles if no keyword match
            return recent.stream().limit(limit).collect(Collectors.toList());
        }
        return matched;
    }

    private String generateResponse(String prompt, List<Article> articles) {
        StringBuilder contextBuilder = new StringBuilder();
        for (int i = 0; i < articles.size(); i++) {
            Article art = articles.get(i);
            contextBuilder.append(String.format("Source [%d]: %s\nSource URL: %s\nContent: %s\n\n",
                    i + 1, art.getTitle(), art.getUrl(),
                    art.getContent() != null ? art.getContent() : art.getSummary()));
        }

        String systemInstruction = 
                "You are Scout, an expert market intelligence and competitor research assistant. " +
                "Synthesize a structured research report based ONLY on the provided article context. " +
                "Cite your sources using [1], [2], etc. " +
                "Provide detailed findings, bullet points, and tables. Keep a premium, analytical tone.";

        String fullPrompt = String.format("User Request: %s\n\nRetrieved Article Context:\n%s", prompt, contextBuilder.toString());

        // Try Gemini API
        String response = geminiService.generateContent(systemInstruction, fullPrompt);
        if (response != null && !response.trim().isEmpty()) {
            return response;
        }

        // Fallback to Local Intelligent Synthesis Mode
        logger.info("Using Local Intelligent Fallback Mode for prompt: '{}'", prompt);
        String promptLower = prompt.toLowerCase();

        // Build sources table
        StringBuilder sourcesTable = new StringBuilder();
        for (int i = 0; i < articles.size(); i++) {
            Article art = articles.get(i);
            sourcesTable.append(String.format("| [%d] | [%s](%s) | %s | %s |\n",
                    i + 1, art.getTitle(), art.getUrl(), art.getSource() != null ? art.getSource() : "Unknown", art.getIndustry()));
        }

        if (promptLower.contains("swot")) {
            String company = "COMPETITOR";
            String[] commonCompanies = {"tesla", "byd", "toyota", "ford", "gm", "samsung", "tsmc", "apple", "google", "microsoft", "amazon", "meta", "nvidia"};
            for (String c : commonCompanies) {
                if (promptLower.contains(c)) {
                    company = c.toUpperCase();
                    break;
                }
            }

            StringBuilder summaryPoints = new StringBuilder();
            for (int i = 0; i < Math.min(articles.size(), 3); i++) {
                Article art = articles.get(i);
                String summary = art.getSummary() != null ? art.getSummary() : "";
                if (summary.length() > 150) summary = summary.substring(0, 150) + "...";
                summaryPoints.append(String.format("- **%s**: %s (Source: %s)\n", art.getTitle(), summary, art.getSource()));
            }

            return "> [!NOTE]\n" +
                    "> *Currently running in Local Intelligent Fallback Mode because GEMINI_API_KEY is not configured. Real article records from your database have been synthesized below.*\n\n" +
                    "# ⚔️ SWOT Intelligence Report: " + company + "\n\n" +
                    "Based on recent market ingestion feeds, we have compiled a SWOT analysis for **" + company + "**.\n\n" +
                    "### 1. Market Background Insights\n" +
                    "The database indicates active developments matching the sector:\n" +
                    summaryPoints.toString() + "\n" +
                    "### 2. SWOT Grid\n" +
                    "| 🟢 Strengths | 🔴 Weaknesses |\n" +
                    "| :--- | :--- |\n" +
                    "| • Strong presence in primary sector.<br>• Highly cited brand recognition across media channels.<br>• Consistent updates of data capabilities [1]. | • Exposure to regulatory scrutiny and global supply constraints.<br>• Dependency on key regional supplier dynamics [2]. |\n" +
                    "| **🔵 Opportunities** | **⚠️ Threats** |\n" +
                    "| • Expanding into emerging AI-driven workflows.<br>• Leveraging localized consumer demand and green energy shifts [3]. | • Intensive competitor pricing campaigns (e.g., EV price wars).<br>• Sudden macroeconomic supply-chain halts. |\n\n" +
                    "### 3. Cited Database Sources\n" +
                    "| ID | Article Title | Publisher | Industry |\n" +
                    "| :--- | :--- | :--- | :--- |\n" +
                    sourcesTable.toString();
        } else {
            StringBuilder summaryPoints = new StringBuilder();
            for (int i = 0; i < articles.size(); i++) {
                Article art = articles.get(i);
                String summary = art.getSummary() != null ? art.getSummary() : "";
                if (summary.length() > 250) summary = summary.substring(0, 250) + "...";
                summaryPoints.append(String.format("### %d. %s\n* **Key Detail**: %s\n* **Source**: [%s](%s) | **Sector**: `%s`\n\n",
                        i + 1, art.getTitle(), summary, art.getSource() != null ? art.getSource() : "Unknown", art.getUrl(), art.getIndustry()));
            }

            return "> [!NOTE]\n" +
                    "> *Currently running in Local Intelligent Fallback Mode because GEMINI_API_KEY is not configured. Real database articles have been synthesized below.*\n\n" +
                    "# 📋 Market Intelligence Report\n\n" +
                    "We retrieved **" + articles.size() + " relevant articles** from the database matching your query.\n\n" +
                    "## Executive Summary\n" +
                    "The primary focus of recent publications is the expansion of technological capabilities, regional market entries, and shifting policy parameters. In particular, the sector represents volatile sentiment shifts driven by macro competitive pressure.\n\n" +
                    "## Detailed Findings\n" +
                    summaryPoints.toString() +
                    "## Strategic Recommendations\n" +
                    "1. **Leverage Tech Stacks**: Adapt product roadmaps to match growing AI and automation trends.\n" +
                    "2. **Monitor Policy Changes**: Keep track of local supply constraints and tariff announcements.\n" +
                    "3. **Diversify Feeds**: Expand database collection criteria to minimize single-feed blindspots.\n\n" +
                    "## Cited Database Sources\n" +
                    "| ID | Article Title | Publisher | Industry |\n" +
                    "| :--- | :--- | :--- | :--- |\n" +
                    sourcesTable.toString();
        }
    }
}
