package com.jiyad.controller;

import com.jiyad.dto.PGResponseDTO;
import com.jiyad.service.PGService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-only listing management (verify / unverify / remove any PG).
 * Gated entirely by the ROLE_ADMIN rule on /api/admin/** in SecurityConfig,
 * so these methods skip the per-owner ownership check.
 */
@RestController
@RequestMapping("/api/admin/pgs")
public class AdminController {

    private final PGService pgService;

    public AdminController(PGService pgService) {
        this.pgService = pgService;
    }

    @GetMapping
    public ResponseEntity<List<PGResponseDTO>> getAllPGs() {
        List<PGResponseDTO> pgs = pgService.getAllPGs().stream()
            .map(PGResponseDTO::from)
            .toList();
        return ResponseEntity.ok(pgs);
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<PGResponseDTO> verify(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean value) {
        return ResponseEntity.ok(PGResponseDTO.from(pgService.setVerified(id, value)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        pgService.deleteByIdAsAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
