package com.jiyad.service;

import com.jiyad.dto.PGCreateDTO;
import com.jiyad.dto.PGUpdateDTO;
import com.jiyad.exception.ResourceNotFoundException;
import com.jiyad.model.PG;
import com.jiyad.repository.PGRepository;
import com.jiyad.security.AuthUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class PGService {

    private final PGRepository pgRepository;

    public PGService(PGRepository pgRepository) {
        this.pgRepository = pgRepository;
    }

    public List<PG> getAllPGs() {
        return pgRepository.findAll();
    }

    public Optional<PG> getPGById(Long id) {
        return pgRepository.findById(id);
    }

    @Transactional
    public PG createPG(PGCreateDTO dto) {
        PG pg = new PG();
        pg.setName(dto.getName());
        pg.setOwnerName(dto.getOwnerName());
        pg.setContactNumber(dto.getContactNumber());
        pg.setAlternateContact(dto.getAlternateContact());
        pg.setAddress(dto.getAddress());
        pg.setLandmark(dto.getLandmark());
        pg.setRentSingle(dto.getRentSingle());
        pg.setRentDouble(dto.getRentDouble());
        pg.setRentTriple(dto.getRentTriple());
        pg.setFoodProvided(dto.getFoodProvided());
        pg.setWifiAvailable(dto.getWifiAvailable());
        pg.setAcAvailable(dto.getAcAvailable());
        pg.setOwnerUserId(AuthUtils.currentUserId());
        return pgRepository.save(pg);
    }

    @Transactional
    public PG updatePG(Long id, PGUpdateDTO dto) {
        PG pg = pgRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PG not found with id " + id));

        assertOwnership(pg);

        if (dto.getName() != null) pg.setName(dto.getName());
        if (dto.getOwnerName() != null) pg.setOwnerName(dto.getOwnerName());
        if (dto.getContactNumber() != null) pg.setContactNumber(dto.getContactNumber());
        if (dto.getAddress() != null) pg.setAddress(dto.getAddress());
        if (dto.getRentSingle() != null) pg.setRentSingle(dto.getRentSingle());
        if (dto.getRentDouble() != null) pg.setRentDouble(dto.getRentDouble());
        if (dto.getFoodProvided() != null) pg.setFoodProvided(dto.getFoodProvided());
        if (dto.getWifiAvailable() != null) pg.setWifiAvailable(dto.getWifiAvailable());
        if (dto.getAcAvailable() != null) pg.setAcAvailable(dto.getAcAvailable());

        if (dto.getAlternateContact() != null) pg.setAlternateContact(dto.getAlternateContact());
        if (dto.getLandmark() != null) pg.setLandmark(dto.getLandmark());
        if (dto.getRentTriple() != null) pg.setRentTriple(dto.getRentTriple());

        return pgRepository.save(pg);
    }

    @Transactional
    public void deletePG(Long id) {
        PG pg = pgRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PG not found with id " + id));
        assertOwnership(pg);
        pgRepository.delete(pg);
    }

    public List<PG> searchPGsByLocation(String location) {
        return pgRepository.findByAddressContainingIgnoreCase(location);
    }

    public List<PG> filterPGsByRent(BigDecimal minRent, BigDecimal maxRent) {
        return pgRepository.findByRentRange(minRent, maxRent);
    }

    private void assertOwnership(PG pg) {
        Long currentUserId = AuthUtils.currentUserId();
        if (!currentUserId.equals(pg.getOwnerUserId())) {
            throw new AccessDeniedException("You can only modify your own listings");
        }
    }
}
