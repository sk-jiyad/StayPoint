package com.jiyad.service;

import com.jiyad.model.PG;
import com.jiyad.repository.PGRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * Rule-based recommendation engine (report §4.2). Filters candidates, then ranks them by a
 * weighted score that mirrors the report's formula
 *   score = -alpha*Rent + beta*Rating - gamma*Distance + delta*VerifiedBonus + epsilon*ReviewCount
 * Rent/Rating/VerifiedBonus/ReviewCount come from real fields; "Distance" is approximated by
 * college match (no lat/long in the model). No ML library — pure weighted scoring + sort top-k.
 */
@Service
@Transactional(readOnly = true)
public class RecommendationService {

    // Weights (sum ~1.0); rent + rating + distance(college) dominate, matching the report's emphasis.
    private static final double W_BUDGET = 0.30;
    private static final double W_RATING = 0.25;
    private static final double W_COLLEGE = 0.15;
    private static final double W_VERIFIED = 0.10;
    private static final double W_REVIEWS = 0.10;
    private static final double W_AVAILABILITY = 0.05;
    private static final double W_AMENITY = 0.05;

    private final PGRepository pgRepository;

    public RecommendationService(PGRepository pgRepository) {
        this.pgRepository = pgRepository;
    }

    public List<PG> recommend(Integer budget, String gender, List<String> amenities,
                              String college, Double minRating, int limit) {
        List<String> wanted = amenities == null ? List.of() : amenities;
        List<PG> candidates = pgRepository.findAll().stream()
            .filter(pg -> !Boolean.TRUE.equals(pg.getHidden()) && !Boolean.TRUE.equals(pg.getFrozen()))
            .filter(pg -> withinBudget(pg, budget))
            .filter(pg -> genderMatches(pg, gender))
            .filter(pg -> hasAllAmenities(pg, wanted))
            .filter(pg -> ratedEnough(pg, minRating))
            .toList();

        // When the user names a college/locality, treat it as a location FILTER (same-city allowed):
        // keep only listings whose college/address/landmark/city matches it, so a PG in a different
        // city is never returned. If nothing matches at all, the result is empty so the caller can
        // honestly report "no PGs near <location>" rather than padding with unrelated listings.
        if (college != null && !college.isBlank()) {
            candidates = candidates.stream()
                .filter(pg -> collegeMatch(pg, college) >= 1.0)
                .toList();
        }

        return candidates.stream()
            .sorted(Comparator.comparingDouble((PG pg) -> score(pg, budget, wanted, college)).reversed())
            .limit(Math.max(1, limit))
            .toList();
    }

    // --- filters ---

    private boolean withinBudget(PG pg, Integer budget) {
        if (budget == null) return true;
        return pg.getRentSingle() != null && pg.getRentSingle().intValue() <= budget;
    }

    private boolean genderMatches(PG pg, String gender) {
        if (gender == null || gender.isBlank()) return true;
        String g = pg.getGender();
        return g == null || g.equalsIgnoreCase(gender) || g.equalsIgnoreCase("coed");
    }

    private boolean hasAllAmenities(PG pg, List<String> wanted) {
        return wanted.stream().allMatch(a -> hasAmenity(pg, a));
    }

    private boolean ratedEnough(PG pg, Double minRating) {
        if (minRating == null) return true;
        return pg.getAvgRating() != null && pg.getAvgRating() >= minRating;
    }

    // --- scoring ---

    double score(PG pg, Integer budget, List<String> wanted, String college) {
        return W_BUDGET * budgetFit(pg, budget)
            + W_RATING * ratingScore(pg)
            + W_COLLEGE * collegeMatch(pg, college)
            + W_VERIFIED * (Boolean.TRUE.equals(pg.getVerified()) ? 1.0 : 0.0)
            + W_REVIEWS * reviewScore(pg)
            + W_AVAILABILITY * availabilityScore(pg)
            + W_AMENITY * amenityScore(pg, wanted);
    }

    private double budgetFit(PG pg, Integer budget) {
        if (budget == null || budget <= 0 || pg.getRentSingle() == null) return 0.5;
        double fit = (budget - pg.getRentSingle().doubleValue()) / budget;
        return clamp01(fit);
    }

    private double ratingScore(PG pg) {
        return pg.getAvgRating() == null ? 0.4 : clamp01(pg.getAvgRating() / 5.0);
    }

    private double reviewScore(PG pg) {
        int n = pg.getReviewCount() == null ? 0 : pg.getReviewCount();
        return Math.min(n, 10) / 10.0;
    }

    private double availabilityScore(PG pg) {
        if (pg.getAvailableRooms() == null) return 0.3;
        return Math.min(pg.getAvailableRooms(), 5) / 5.0;
    }

    private double collegeMatch(PG pg, String location) {
        if (location == null || location.isBlank()) return 0.5;
        String b = location.toLowerCase().trim();
        // Match the requested location against any place field on the listing, not just the
        // nearby college — users often name a locality or landmark (e.g. "Botanic Garden") that
        // lives in the address rather than the college field.
        for (String field : new String[]{ pg.getNearbyCollege(), pg.getAddress(),
                                           pg.getLandmark(), pg.getCity() }) {
            if (field == null || field.isBlank()) continue;
            String a = field.toLowerCase();
            if (a.contains(b) || b.contains(a)) return 1.0;
        }
        return 0.0;
    }

    private double amenityScore(PG pg, List<String> wanted) {
        if (wanted.isEmpty()) {
            // richness: how many of the six amenities this PG offers
            int have = 0;
            for (String a : List.of("wifi", "food", "ac", "laundry", "parking", "bath")) {
                if (hasAmenity(pg, a)) have++;
            }
            return have / 6.0;
        }
        long matched = wanted.stream().filter(a -> hasAmenity(pg, a)).count();
        return (double) matched / wanted.size();
    }

    private boolean hasAmenity(PG pg, String amenity) {
        return switch (amenity.toLowerCase()) {
            case "wifi" -> Boolean.TRUE.equals(pg.getWifiAvailable());
            case "food", "meals", "mess" -> Boolean.TRUE.equals(pg.getFoodProvided());
            case "ac" -> Boolean.TRUE.equals(pg.getAcAvailable());
            case "laundry" -> Boolean.TRUE.equals(pg.getLaundryAvailable());
            case "parking" -> Boolean.TRUE.equals(pg.getParkingAvailable());
            case "bath", "attached", "bathroom" -> Boolean.TRUE.equals(pg.getAttachedBathroom());
            default -> false;
        };
    }

    private double clamp01(double v) {
        return Math.max(0.0, Math.min(1.0, v));
    }
}
