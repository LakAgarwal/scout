package com.scout.repository;

import com.scout.model.Topic;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {

    @Query("SELECT t FROM Topic t ORDER BY t.frequency DESC")
    List<Topic> findTopTopics(Pageable pageable);
}
