package com.jiyad.controller;

import com.jiyad.dto.ReviewCreateDTO;
import com.jiyad.dto.ReviewResponseDTO;
import com.jiyad.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pgs/{pgId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponseDTO>> getReviews(@PathVariable Long pgId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviews(pgId).stream()
            .map(ReviewResponseDTO::from)
            .toList();
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDTO> addReview(
            @PathVariable Long pgId,
            @Valid @RequestBody ReviewCreateDTO dto) {
        ReviewResponseDTO saved = ReviewResponseDTO.from(reviewService.addOrUpdateReview(pgId, dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
