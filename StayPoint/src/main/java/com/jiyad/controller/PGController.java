package com.jiyad.controller;

import com.jiyad.dto.PGCreateDTO;
import com.jiyad.dto.PGResponseDTO;
import com.jiyad.dto.PGUpdateDTO;
import com.jiyad.exception.ResourceNotFoundException;
import com.jiyad.model.PG;
import com.jiyad.service.PGService;
import com.jiyad.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/pgs")
public class PGController {

    private final PGService pgService;
    private final RecommendationService recommendationService;

    public PGController(PGService pgService, RecommendationService recommendationService) {
        this.pgService = pgService;
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public ResponseEntity<List<PGResponseDTO>> getAllPGs() {
        List<PGResponseDTO> pgs = pgService.getAllPGs().stream()
            .map(PGResponseDTO::from)
            .toList();
        return ResponseEntity.ok(pgs);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<PGResponseDTO>> getMyPGs() {
        List<PGResponseDTO> pgs = pgService.getMyPGs().stream()
            .map(PGResponseDTO::from)
            .toList();
        return ResponseEntity.ok(pgs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PGResponseDTO> getPGById(@PathVariable Long id) {
        PG pg = pgService.getPGById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PG not found with id " + id));
        return ResponseEntity.ok(PGResponseDTO.from(pg));
    }

    @PostMapping
    public ResponseEntity<PGResponseDTO> createPG(@Valid @RequestBody PGCreateDTO dto) {
        PG savedPG = pgService.createPG(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(PGResponseDTO.from(savedPG));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PGResponseDTO> updatePG(
            @PathVariable Long id,
            @Valid @RequestBody PGUpdateDTO dto) {
        PG updatedPG = pgService.updatePG(id, dto);
        return ResponseEntity.ok(PGResponseDTO.from(updatedPG));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePG(@PathVariable Long id) {
        pgService.deletePG(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<PGResponseDTO>> searchPGs(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String college) {
        List<PG> results;
        if (college != null && !college.isBlank()) {
            results = pgService.searchPGsByCollege(college);
        } else {
            results = pgService.searchPGsByLocation(location == null ? "" : location);
        }
        List<PGResponseDTO> pgs = results.stream()
            .map(PGResponseDTO::from)
            .toList();
        return ResponseEntity.ok(pgs);
    }

    @GetMapping("/recommend")
    public ResponseEntity<List<PGResponseDTO>> recommend(
            @RequestParam(required = false) Integer budget,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false) String college,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "3") int limit) {
        List<PGResponseDTO> pgs = recommendationService
            .recommend(budget, gender, amenities, college, minRating, limit).stream()
            .map(PGResponseDTO::from)
            .toList();
        return ResponseEntity.ok(pgs);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<PGResponseDTO>> filterPGs(
            @RequestParam BigDecimal minRent,
            @RequestParam BigDecimal maxRent) {
        List<PGResponseDTO> pgs = pgService.filterPGsByRent(minRent, maxRent).stream()
            .map(PGResponseDTO::from)
            .toList();
        return ResponseEntity.ok(pgs);
    }
}
