package com.jiyad.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jiyad.dto.PGCreateDTO;
import com.jiyad.exception.ResourceNotFoundException;
import com.jiyad.security.JwtAuthFilter;
import com.jiyad.service.PGService;
import com.jiyad.service.RecommendationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PGController.class)
@AutoConfigureMockMvc(addFilters = false)
class PGControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private PGService pgService;
    @MockitoBean private RecommendationService recommendationService;
    @MockitoBean private JwtAuthFilter jwtAuthFilter;

    @Test
    void getAllPGs_returnsEmptyJsonArray() throws Exception {
        when(pgService.getAllPGs()).thenReturn(List.of());

        mockMvc.perform(get("/api/pgs"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(content().json("[]"));
    }

    @Test
    void getPGById_whenNotFound_returns404() throws Exception {
        when(pgService.getPGById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/pgs/99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.message").value("PG not found with id 99"));
    }

    @Test
    void createPG_withInvalidBody_returns400WithFieldErrors() throws Exception {
        String invalidJson = "{\"name\":\"X\",\"contactNumber\":\"abc\"}";

        mockMvc.perform(post("/api/pgs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.message").value("Validation failed"))
            .andExpect(jsonPath("$.errors.contactNumber").exists())
            .andExpect(jsonPath("$.errors.address").exists())
            .andExpect(jsonPath("$.errors.rentSingle").exists())
            .andExpect(jsonPath("$.errors.foodProvided").exists());
    }

    @Test
    void createPG_withValidBody_returns201() throws Exception {
        PGCreateDTO dto = new PGCreateDTO();
        dto.setName("Test PG");
        dto.setOwnerName("Tester");
        dto.setContactNumber("1234567890");
        dto.setAddress("123 Some Long Street Name");
        dto.setRentSingle(new BigDecimal("5000"));
        dto.setRentDouble(new BigDecimal("7000"));
        dto.setFoodProvided(true);
        dto.setWifiAvailable(true);
        dto.setAcAvailable(false);

        com.jiyad.model.PG saved = new com.jiyad.model.PG();
        saved.setId(1L);
        saved.setName("Test PG");
        saved.setOwnerUserId(42L);
        when(pgService.createPG(any(PGCreateDTO.class))).thenReturn(saved);

        mockMvc.perform(post("/api/pgs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("Test PG"));
    }

    @Test
    void getPGById_propagatesServiceNotFound() throws Exception {
        when(pgService.getPGById(99L)).thenThrow(
            new ResourceNotFoundException("PG not found with id 99"));

        mockMvc.perform(get("/api/pgs/99"))
            .andExpect(status().isNotFound());
    }

    @Test
    void getMyPGs_returnsOwnersListings() throws Exception {
        com.jiyad.model.PG pg = new com.jiyad.model.PG();
        pg.setId(1L);
        pg.setName("Mine PG");
        pg.setOwnerUserId(42L);
        when(pgService.getMyPGs()).thenReturn(List.of(pg));

        mockMvc.perform(get("/api/pgs/mine"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].name").value("Mine PG"));
    }
}
