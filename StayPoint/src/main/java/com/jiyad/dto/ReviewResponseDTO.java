package com.jiyad.dto;

import com.jiyad.model.Review;

import java.time.Instant;

public class ReviewResponseDTO {

    private Long id;
    private Long pgId;
    private String authorName;
    private int rating;
    private String comment;
    private Instant createdAt;

    public static ReviewResponseDTO from(Review r) {
        ReviewResponseDTO dto = new ReviewResponseDTO();
        dto.id = r.getId();
        dto.pgId = r.getPgId();
        dto.authorName = r.getAuthorName();
        dto.rating = r.getRating();
        dto.comment = r.getComment();
        dto.createdAt = r.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public Long getPgId() { return pgId; }
    public String getAuthorName() { return authorName; }
    public int getRating() { return rating; }
    public String getComment() { return comment; }
    public Instant getCreatedAt() { return createdAt; }
}
