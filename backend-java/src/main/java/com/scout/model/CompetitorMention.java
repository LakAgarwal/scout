package com.scout.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "competitor_mentions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompetitorMention {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "article_id", nullable = false)
    @JsonIgnore
    private Article article;

    @Column(name = "company_name", length = 255, nullable = false)
    private String companyName;

    @Column(name = "mention_count", nullable = false)
    private Integer mentionCount = 1;

    @Column(name = "context_snippet", columnDefinition = "TEXT")
    private String contextSnippet;
}
