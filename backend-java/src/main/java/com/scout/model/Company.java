package com.scout.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(name = "company_name", length = 255, unique = true, nullable = false)
    private String companyName;

    @Column(length = 100)
    private String industry;

    @Column(length = 100)
    private String country;

    @Column(columnDefinition = "TEXT")
    private String description;
}
