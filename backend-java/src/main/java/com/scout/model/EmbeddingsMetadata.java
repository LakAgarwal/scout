package com.scout.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "embeddings_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmbeddingsMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID")
    private UUID id;

    @OneToOne
    @JoinColumn(name = "article_id", nullable = false, unique = true)
    @JsonIgnore
    private Article article;

    @Column(name = "vector_id", length = 255, nullable = false)
    private String vectorId;
}
