package com.scout.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        return Map.of("status", "ok");
    }

    @GetMapping("/health/db")
    public Map<String, String> dbHealthCheck() {
        Map<String, String> response = new HashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                response.put("status", "ok");
                response.put("db", "connected");
            } else {
                response.put("status", "error");
                response.put("db", "connection invalid");
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("db", "Database connection failed: " + e.getMessage());
        }
        return response;
    }
}
