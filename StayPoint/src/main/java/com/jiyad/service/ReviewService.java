package com.jiyad.service;

import com.jiyad.dto.ReviewCreateDTO;
import com.jiyad.exception.ResourceNotFoundException;
import com.jiyad.model.PG;
import com.jiyad.model.Review;
import com.jiyad.repository.PGRepository;
import com.jiyad.repository.ReviewRepository;
import com.jiyad.security.AuthUserPrincipal;
import com.jiyad.security.AuthUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PGRepository pgRepository;

    public ReviewService(ReviewRepository reviewRepository, PGRepository pgRepository) {
        this.reviewRepository = reviewRepository;
        this.pgRepository = pgRepository;
    }

    public List<Review> getReviews(Long pgId) {
        return reviewRepository.findByPgIdOrderByCreatedAtDesc(pgId);
    }

    /**
     * Add or update the current user's review for a PG (one review per user per PG),
     * then recompute and store the PG's denormalised avgRating + reviewCount.
     */
    @Transactional
    public Review addOrUpdateReview(Long pgId, ReviewCreateDTO dto) {
        PG pg = pgRepository.findById(pgId)
            .orElseThrow(() -> new ResourceNotFoundException("PG not found with id " + pgId));

        AuthUserPrincipal principal = AuthUtils.currentPrincipal();
        Long authorUserId = principal.getId();

        if (authorUserId.equals(pg.getOwnerUserId())) {
            throw new AccessDeniedException("You cannot review your own listing");
        }

        Review review = reviewRepository.findByPgIdAndAuthorUserId(pgId, authorUserId)
            .orElseGet(Review::new);
        review.setPgId(pgId);
        review.setAuthorUserId(authorUserId);
        review.setAuthorName(displayName(principal.getUsername()));
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        if (review.getCreatedAt() == null) review.setCreatedAt(Instant.now());
        review = reviewRepository.save(review);

        recomputeAggregates(pg);
        return review;
    }

    private void recomputeAggregates(PG pg) {
        List<Review> all = reviewRepository.findByPgId(pg.getId());
        int count = all.size();
        double avg = count == 0 ? 0.0
            : all.stream().mapToInt(Review::getRating).average().orElse(0.0);
        pg.setReviewCount(count);
        pg.setAvgRating(count == 0 ? null : Math.round(avg * 10.0) / 10.0);
        pgRepository.save(pg);
    }

    // Show a friendly name without leaking the full email: "alice@x.com" -> "alice"
    private String displayName(String email) {
        if (email == null || email.isBlank()) return "Resident";
        int at = email.indexOf('@');
        return at > 0 ? email.substring(0, at) : email;
    }
}
