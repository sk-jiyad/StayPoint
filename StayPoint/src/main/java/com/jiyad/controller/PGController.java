package com.jiyad.controller;

import com.jiyad.dto.PGCreateDTO;
import com.jiyad.dto.PGResponseDTO;
import com.jiyad.dto.PGUpdateDTO;
import com.jiyad.exception.ResourceNotFoundException;
import com.jiyad.model.PG;
import com.jiyad.service.PGService;
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

    public PGController(PGService pgService) {
        this.pgService = pgService;
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
    public ResponseEntity<List<PGResponseDTO>> searchPGs(@RequestParam String location) {
        List<PGResponseDTO> pgs = pgService.searchPGsByLocation(location).stream()
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
