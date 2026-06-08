package com.jiyad.repository;

import com.jiyad.model.PG;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PGRepository extends JpaRepository<PG, Long> {
    
    // Find PGs by location (address contains keyword)
    List<PG> findByAddressContainingIgnoreCase(String location);
    
    // Find PGs within rent range
    @Query("SELECT p FROM PG p WHERE p.rentSingle BETWEEN :minRent AND :maxRent")
    List<PG> findByRentRange(@Param("minRent") BigDecimal minRent,
                           @Param("maxRent") BigDecimal maxRent);

    // PGs created by a specific user (powers the owner "My Listings" dashboard)
    List<PG> findByOwnerUserId(Long ownerUserId);
}
