package com.scout.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "sentiment_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SentimentScore {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID")
    private UUID id;

    @OneToOne
    @JoinColumn(name = "article_id", nullable = false, unique = true)
    @JsonIgnore
    private Article article;

    @Column(length = 50, nullable = false)
    private String sentiment; // positive, negative, neutral

    @Column(nullable = false)
    private Double score; // confidence score
}
