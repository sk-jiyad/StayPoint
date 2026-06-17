package com.jiyad.service;

import com.jiyad.dto.PGCreateDTO;
import com.jiyad.dto.PGUpdateDTO;
import com.jiyad.exception.ResourceNotFoundException;
import com.jiyad.model.PG;
import com.jiyad.model.Role;
import com.jiyad.model.User;
import com.jiyad.repository.PGRepository;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PGServiceTest {

    @Mock
    private PGRepository pgRepository;

    @Mock
    private SettingsService settingsService;

    @InjectMocks
    private PGService pgService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long userId) {
        User u = new User("u" + userId + "@test.com", "hash", Role.ROLE_OWNER);
        u.setId(userId);
        AuthUserPrincipal principal = new AuthUserPrincipal(u);
        Authentication auth = new UsernamePasswordAuthenticationToken(
            principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private PGCreateDTO validCreateDto() {
        PGCreateDTO d = new PGCreateDTO();
        d.setName("Test PG");
        d.setOwnerName("Tester");
        d.setContactNumber("1234567890");
        d.setAddress("123 Some Long Street Name");
        d.setRentSingle(new BigDecimal("5000"));
        d.setRentDouble(new BigDecimal("7000"));
        d.setFoodProvided(true);
        d.setWifiAvailable(true);
        d.setAcAvailable(false);
        return d;
    }

    @Test
    void getPGById_whenExists_returnsPG() {
        PG pg = new PG();
        pg.setId(1L);
        pg.setName("Test PG");
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));

        Optional<PG> result = pgService.getPGById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test PG", result.get().getName());
        verify(pgRepository).findById(1L);
    }

    @Test
    void getPGById_whenNotExists_returnsEmpty() {
        when(pgRepository.findById(99L)).thenReturn(Optional.empty());

        assertTrue(pgService.getPGById(99L).isEmpty());
    }

    @Test
    void createPG_stampsCurrentUserIdAsOwner() {
        authenticateAs(42L);
        when(pgRepository.save(any(PG.class))).thenAnswer(inv -> inv.getArgument(0));

        pgService.createPG(validCreateDto());

        ArgumentCaptor<PG> captor = ArgumentCaptor.forClass(PG.class);
        verify(pgRepository).save(captor.capture());
        assertEquals(42L, captor.getValue().getOwnerUserId());
    }

    @Test
    void updatePG_whenNotFound_throwsResourceNotFoundException() {
        when(pgRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> pgService.updatePG(99L, new PGUpdateDTO()));
        verify(pgRepository, never()).save(any());
    }

    @Test
    void updatePG_whenNotOwner_throwsAccessDenied() {
        authenticateAs(42L);
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId(99L);
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));

        assertThrows(AccessDeniedException.class,
            () -> pgService.updatePG(1L, new PGUpdateDTO()));
        verify(pgRepository, never()).save(any());
    }

    @Test
    void deletePG_whenNotOwner_throwsAccessDenied() {
        authenticateAs(42L);
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId(99L);
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));

        assertThrows(AccessDeniedException.class, () -> pgService.deletePG(1L));
        verify(pgRepository, never()).delete(any());
    }

    @Test
    void deletePG_whenOwner_deletes() {
        authenticateAs(42L);
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId(42L);
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));

        pgService.deletePG(1L);

        verify(pgRepository).delete(pg);
    }

    @Test
    void getMyPGs_returnsOnlyCurrentOwnersPGs() {
        authenticateAs(42L);
        PG mine = new PG();
        mine.setId(1L);
        mine.setOwnerUserId(42L);
        when(pgRepository.findByOwnerUserId(42L)).thenReturn(List.of(mine));

        List<PG> result = pgService.getMyPGs();

        assertEquals(1, result.size());
        assertEquals(42L, result.get(0).getOwnerUserId());
        verify(pgRepository).findByOwnerUserId(42L);
    }

    @Test
    void createPG_persistsImageUrls() {
        authenticateAs(7L);
        when(pgRepository.save(any(PG.class))).thenAnswer(inv -> inv.getArgument(0));
        PGCreateDTO dto = validCreateDto();
        dto.setImageUrls(List.of("https://img/a.jpg", "https://img/b.jpg"));

        pgService.createPG(dto);

        ArgumentCaptor<PG> captor = ArgumentCaptor.forClass(PG.class);
        verify(pgRepository).save(captor.capture());
        assertEquals(List.of("https://img/a.jpg", "https://img/b.jpg"), captor.getValue().getImageUrls());
    }

    @Test
    void createPG_persistsGenderAndRooms() {
        authenticateAs(7L);
        when(pgRepository.save(any(PG.class))).thenAnswer(inv -> inv.getArgument(0));
        PGCreateDTO dto = validCreateDto();
        dto.setGender("girls");
        dto.setTotalRooms(10);
        dto.setAvailableRooms(3);

        pgService.createPG(dto);

        ArgumentCaptor<PG> captor = ArgumentCaptor.forClass(PG.class);
        verify(pgRepository).save(captor.capture());
        assertEquals("girls", captor.getValue().getGender());
        assertEquals(3, captor.getValue().getAvailableRooms());
    }

    @Test
    void getVisiblePGs_excludesHiddenAndFrozen() {
        PG live = new PG(); live.setId(1L);
        PG hidden = new PG(); hidden.setId(2L); hidden.setHidden(true);
        PG frozen = new PG(); frozen.setId(3L); frozen.setFrozen(true);
        when(pgRepository.findAll()).thenReturn(List.of(live, hidden, frozen));

        List<PG> result = pgService.getVisiblePGs();

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void releaseFrozen_clearsFrozenButLeavesManualHidden() {
        PG frozen = new PG(); frozen.setId(1L); frozen.setFrozen(true);
        PG hidden = new PG(); hidden.setId(2L); hidden.setHidden(true);
        when(pgRepository.findAll()).thenReturn(List.of(frozen, hidden));

        pgService.releaseFrozen();

        assertEquals(false, frozen.getFrozen());
        assertEquals(true, hidden.getHidden());
        verify(pgRepository).saveAll(List.of(frozen));
    }

    @Test
    void createPG_marksFrozenWhenUploadsFrozen() {
        authenticateAs(7L);
        when(settingsService.isUploadsFrozen()).thenReturn(true);
        when(pgRepository.save(any(PG.class))).thenAnswer(inv -> inv.getArgument(0));

        pgService.createPG(validCreateDto());

        ArgumentCaptor<PG> captor = ArgumentCaptor.forClass(PG.class);
        verify(pgRepository).save(captor.capture());
        assertEquals(true, captor.getValue().getFrozen());
    }
}
