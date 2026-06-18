package com.jiyad.service;

import com.jiyad.model.PG;
import com.jiyad.repository.PGRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private PGRepository pgRepository;

    @InjectMocks
    private RecommendationService recommendationService;

    private PG pg(long id, String name, int rentSingle, String gender, boolean wifi,
                  Double avgRating, Integer reviewCount, Boolean verified, Integer availableRooms,
                  String college) {
        PG p = new PG();
        p.setId(id);
        p.setName(name);
        p.setRentSingle(new BigDecimal(rentSingle));
        p.setGender(gender);
        p.setWifiAvailable(wifi);
        p.setFoodProvided(false);
        p.setAcAvailable(false);
        p.setAvgRating(avgRating);
        p.setReviewCount(reviewCount);
        p.setVerified(verified);
        p.setAvailableRooms(availableRooms);
        p.setNearbyCollege(college);
        return p;
    }

    @Test
    void recommend_dropsOverBudget() {
        PG cheap = pg(1, "Cheap", 5000, "coed", true, 4.0, 5, true, 3, "Jamia");
        PG pricey = pg(2, "Pricey", 9000, "coed", true, 5.0, 9, true, 3, "Jamia");
        when(pgRepository.findAll()).thenReturn(List.of(cheap, pricey));

        List<PG> out = recommendationService.recommend(6000, null, List.of(), null, null, 5);

        assertEquals(1, out.size());
        assertEquals("Cheap", out.get(0).getName());
    }

    @Test
    void recommend_filtersByGenderKeepingCoed() {
        PG boys = pg(1, "Boys", 5000, "boys", true, 4.0, 5, true, 3, null);
        PG girls = pg(2, "Girls", 5000, "girls", true, 4.0, 5, true, 3, null);
        PG coed = pg(3, "Coed", 5000, "coed", true, 4.0, 5, true, 3, null);
        when(pgRepository.findAll()).thenReturn(List.of(boys, girls, coed));

        List<PG> out = recommendationService.recommend(null, "girls", List.of(), null, null, 5);

        assertEquals(2, out.size());
        assertTrue(out.stream().noneMatch(p -> p.getName().equals("Boys")));
    }

    @Test
    void recommend_ranksVerifiedRatedCheaperFirst() {
        PG strong = pg(1, "Strong", 4000, "coed", true, 5.0, 10, true, 5, "Jamia");
        PG weak = pg(2, "Weak", 5500, "coed", true, 2.0, 0, false, 1, null);
        when(pgRepository.findAll()).thenReturn(List.of(weak, strong));

        List<PG> out = recommendationService.recommend(6000, null, List.of("wifi"), "Jamia", null, 5);

        assertEquals("Strong", out.get(0).getName());
    }

    @Test
    void recommend_minRatingFiltersUnrated() {
        PG good = pg(1, "Good", 5000, "coed", true, 4.5, 8, true, 3, null);
        PG meh = pg(2, "Meh", 5000, "coed", true, 3.0, 4, true, 3, null);
        when(pgRepository.findAll()).thenReturn(List.of(good, meh));

        List<PG> out = recommendationService.recommend(null, null, List.of(), null, 4.0, 5);

        assertEquals(1, out.size());
        assertEquals("Good", out.get(0).getName());
    }

    @Test
    void recommend_requiredAmenityFiltersOut() {
        PG withWifi = pg(1, "Wifi", 5000, "coed", true, 4.0, 5, true, 3, null);
        PG noWifi = pg(2, "NoWifi", 5000, "coed", false, 5.0, 9, true, 3, null);
        when(pgRepository.findAll()).thenReturn(List.of(withWifi, noWifi));

        List<PG> out = recommendationService.recommend(null, null, List.of("wifi"), null, null, 5);

        assertEquals(1, out.size());
        assertEquals("Wifi", out.get(0).getName());
    }
}
