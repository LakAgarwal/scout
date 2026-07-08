package com.scout.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.jdbc.DataSourceBuilder;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Bean
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            logger.info("DATABASE_URL environment variable is not set. Using default application.properties values.");
            return DataSourceBuilder.create()
                    .url("jdbc:postgresql://localhost:5432/scout_db")
                    .username("postgres")
                    .password("postgres")
                    .driverClassName("org.postgresql.Driver")
                    .build();
        }

        try {
            logger.info("Parsing DATABASE_URL environment variable: {}", databaseUrl);
            
            // Clean up scheme prefix for URI parsing if needed
            String cleanUrl = databaseUrl;
            if (cleanUrl.startsWith("postgresql://")) {
                cleanUrl = cleanUrl.replace("postgresql://", "postgres://");
            }

            URI dbUri = new URI(cleanUrl);
            String userInfo = dbUri.getUserInfo();
            String username = "";
            String password = "";

            if (userInfo != null && userInfo.contains(":")) {
                String[] credentials = userInfo.split(":", 2);
                username = credentials[0];
                password = credentials[1];
            }

            // Construct JDBC connection string
            String host = dbUri.getHost();
            int port = dbUri.getPort();
            if (port == -1) {
                port = 5432; // Default PostgreSQL port
            }
            String path = dbUri.getPath();

            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
            
            logger.info("Configured JDBC URL: {}", jdbcUrl);

            return DataSourceBuilder.create()
                    .url(jdbcUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();

        } catch (Exception e) {
            logger.error("Failed to parse DATABASE_URL environment variable. Falling back to default properties.", e);
            return DataSourceBuilder.create()
                    .url("jdbc:postgresql://localhost:5432/scout_db")
                    .username("postgres")
                    .password("postgres")
                    .driverClassName("org.postgresql.Driver")
                    .build();
        }
    }
}
