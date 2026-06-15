package com.jiyad.service;

import com.jiyad.dto.ReviewCreateDTO;
import com.jiyad.model.PG;
import com.jiyad.model.Review;
import com.jiyad.model.Role;
import com.jiyad.model.User;
import com.jiyad.repository.PGRepository;
import com.jiyad.repository.ReviewRepository;
import com.jiyad.security.AuthUserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private PGRepository pgRepository;
    @InjectMocks private ReviewService reviewService;

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long userId) {
        User u = new User("reviewer" + userId + "@test.com", "hash", Role.ROLE_USER);
        u.setId(userId);
        AuthUserPrincipal principal = new AuthUserPrincipal(u);
        Authentication auth = new UsernamePasswordAuthenticationToken(
            principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private ReviewCreateDTO dto(int rating, String comment) {
        ReviewCreateDTO d = new ReviewCreateDTO();
        d.setRating(rating);
        d.setComment(comment);
        return d;
    }

    @Test
    void ownerCannotReviewOwnPg() {
        authenticateAs(42L);
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId(42L);
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));

        assertThrows(AccessDeniedException.class, () -> reviewService.addOrUpdateReview(1L, dto(5, "great")));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void addReview_savesAndRecomputesAggregates() {
        authenticateAs(7L);
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId(99L);
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));
        when(reviewRepository.findByPgIdAndAuthorUserId(1L, 7L)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

        Review r4 = new Review(); r4.setRating(4);
        Review r2 = new Review(); r2.setRating(2);
        when(reviewRepository.findByPgId(1L)).thenReturn(List.of(r4, r2));

        reviewService.addOrUpdateReview(1L, dto(4, "decent"));

        ArgumentCaptor<PG> pgCaptor = ArgumentCaptor.forClass(PG.class);
        verify(pgRepository).save(pgCaptor.capture());
        assertEquals(2, pgCaptor.getValue().getReviewCount());
        assertEquals(3.0, pgCaptor.getValue().getAvgRating());
    }

    @Test
    void addReview_upsertsExistingReview() {
        authenticateAs(7L);
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId(99L);
        Review existing = new Review();
        existing.setId(55L);
        existing.setPgId(1L);
        existing.setAuthorUserId(7L);
        existing.setRating(2);
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));
        when(reviewRepository.findByPgIdAndAuthorUserId(1L, 7L)).thenReturn(Optional.of(existing));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepository.findByPgId(1L)).thenReturn(List.of(existing));

        Review saved = reviewService.addOrUpdateReview(1L, dto(5, "improved"));

        assertEquals(55L, saved.getId());
        assertEquals(5, saved.getRating());
    }
}
