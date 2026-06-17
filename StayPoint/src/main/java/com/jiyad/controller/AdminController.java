package com.jiyad.controller;

import com.jiyad.dto.PGResponseDTO;
import com.jiyad.service.PGService;
import com.jiyad.service.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin-only moderation: verify/hide/remove any PG, and the global "freeze new uploads" switch.
 * Gated entirely by the ROLE_ADMIN rule on /api/admin/** in SecurityConfig, so these methods
 * skip the per-owner ownership check.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final PGService pgService;
    private final SettingsService settingsService;

    public AdminController(PGService pgService, SettingsService settingsService) {
        this.pgService = pgService;
        this.settingsService = settingsService;
    }

    @GetMapping("/pgs")
    public ResponseEntity<List<PGResponseDTO>> getAllPGs() {
        List<PGResponseDTO> pgs = pgService.getAllPGs().stream()
            .map(PGResponseDTO::from)
            .toList();
        return ResponseEntity.ok(pgs);
    }

    @PutMapping("/pgs/{id}/verify")
    public ResponseEntity<PGResponseDTO> verify(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean value) {
        return ResponseEntity.ok(PGResponseDTO.from(pgService.setVerified(id, value)));
    }

    @PutMapping("/pgs/{id}/hidden")
    public ResponseEntity<PGResponseDTO> setHidden(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean value) {
        return ResponseEntity.ok(PGResponseDTO.from(pgService.setHidden(id, value)));
    }

    @DeleteMapping("/pgs/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        pgService.deleteByIdAsAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Boolean>> settings() {
        return ResponseEntity.ok(Map.of("uploadsFrozen", settingsService.isUploadsFrozen()));
    }

    @PutMapping("/uploads-frozen")
    public ResponseEntity<Map<String, Boolean>> setUploadsFrozen(
            @RequestParam(defaultValue = "true") boolean value) {
        settingsService.setUploadsFrozen(value);
        if (!value) {
            pgService.releaseFrozen(); // lifting the freeze releases all held listings
        }
        return ResponseEntity.ok(Map.of("uploadsFrozen", value));
    }
}
