package com.jiyad.repository;

import com.jiyad.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByPgIdOrderByCreatedAtDesc(Long pgId);

    // Powers the one-review-per-user upsert
    Optional<Review> findByPgIdAndAuthorUserId(Long pgId, Long authorUserId);

    long countByPgId(Long pgId);

    List<Review> findByPgId(Long pgId);
}
