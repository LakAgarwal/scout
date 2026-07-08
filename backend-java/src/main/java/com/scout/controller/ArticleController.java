package com.scout.controller;

import com.scout.model.Article;
import com.scout.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "*")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    @GetMapping
    public List<Article> getArticles(
            @RequestParam(name = "skip", defaultValue = "0") int skip,
            @RequestParam(name = "limit", defaultValue = "100") int limit,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "industry", required = false) String industry,
            @RequestParam(name = "topic", required = false) String topic
    ) {
        return articleService.getArticles(skip, limit, search, industry, topic);
    }

    @GetMapping("/{id}")
    public Article getArticle(@PathVariable("id") UUID id) {
        return articleService.getArticle(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found"));
    }

    @GetMapping("/fetch-internet")
    public Map<String, Object> fetchInternetArticles(@RequestParam("q") String query) {
        return articleService.fetchInternetArticles(query);
    }

    @PostMapping("/ingest-keyword")
    public Map<String, Object> ingestKeyword(@RequestParam("q") String query) {
        Map<String, Object> result = articleService.ingestKeyword(query);
        if ("error".equals(result.get("status"))) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, (String) result.get("detail"));
        }
        return result;
    }
}
