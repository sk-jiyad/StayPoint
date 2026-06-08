package com.jiyad.dto;

import com.jiyad.model.PG;
import java.math.BigDecimal;
import java.util.List;

public class PGResponseDTO {

    private Long id;
    private String name;
    private String ownerName;
    private String contactNumber;
    private String alternateContact;
    private String address;
    private String landmark;
    private BigDecimal rentSingle;
    private BigDecimal rentDouble;
    private BigDecimal rentTriple;
    private Boolean foodProvided;
    private Boolean wifiAvailable;
    private Boolean acAvailable;
    private List<String> imageUrls;
    private String gender;
    private Integer totalRooms;
    private Integer availableRooms;

    public static PGResponseDTO from(PG pg) {
        PGResponseDTO dto = new PGResponseDTO();
        dto.id = pg.getId();
        dto.name = pg.getName();
        dto.ownerName = pg.getOwnerName();
        dto.contactNumber = pg.getContactNumber();
        dto.alternateContact = pg.getAlternateContact();
        dto.address = pg.getAddress();
        dto.landmark = pg.getLandmark();
        dto.rentSingle = pg.getRentSingle();
        dto.rentDouble = pg.getRentDouble();
        dto.rentTriple = pg.getRentTriple();
        dto.foodProvided = pg.getFoodProvided();
        dto.wifiAvailable = pg.getWifiAvailable();
        dto.acAvailable = pg.getAcAvailable();
        dto.imageUrls = pg.getImageUrls();
        dto.gender = pg.getGender();
        dto.totalRooms = pg.getTotalRooms();
        dto.availableRooms = pg.getAvailableRooms();
        return dto;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getOwnerName() { return ownerName; }
    public String getContactNumber() { return contactNumber; }
    public String getAlternateContact() { return alternateContact; }
    public String getAddress() { return address; }
    public String getLandmark() { return landmark; }
    public BigDecimal getRentSingle() { return rentSingle; }
    public BigDecimal getRentDouble() { return rentDouble; }
    public BigDecimal getRentTriple() { return rentTriple; }
    public Boolean getFoodProvided() { return foodProvided; }
    public Boolean getWifiAvailable() { return wifiAvailable; }
    public Boolean getAcAvailable() { return acAvailable; }
    public List<String> getImageUrls() { return imageUrls; }
    public String getGender() { return gender; }
    public Integer getTotalRooms() { return totalRooms; }
    public Integer getAvailableRooms() { return availableRooms; }
}
