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
    private String city;
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
    private Boolean verified;
    private String nearbyCollege;
    private Boolean laundryAvailable;
    private Boolean parkingAvailable;
    private Boolean attachedBathroom;
    private Double avgRating;
    private Integer reviewCount;

    public static PGResponseDTO from(PG pg) {
        PGResponseDTO dto = new PGResponseDTO();
        dto.id = pg.getId();
        dto.name = pg.getName();
        dto.ownerName = pg.getOwnerName();
        dto.contactNumber = pg.getContactNumber();
        dto.alternateContact = pg.getAlternateContact();
        dto.address = pg.getAddress();
        dto.city = pg.getCity();
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
        dto.verified = pg.getVerified();
        dto.nearbyCollege = pg.getNearbyCollege();
        dto.laundryAvailable = pg.getLaundryAvailable();
        dto.parkingAvailable = pg.getParkingAvailable();
        dto.attachedBathroom = pg.getAttachedBathroom();
        dto.avgRating = pg.getAvgRating();
        dto.reviewCount = pg.getReviewCount();
        return dto;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getOwnerName() { return ownerName; }
    public String getContactNumber() { return contactNumber; }
    public String getAlternateContact() { return alternateContact; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
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
    public Boolean getVerified() { return verified; }
    public String getNearbyCollege() { return nearbyCollege; }
    public Boolean getLaundryAvailable() { return laundryAvailable; }
    public Boolean getParkingAvailable() { return parkingAvailable; }
    public Boolean getAttachedBathroom() { return attachedBathroom; }
    public Double getAvgRating() { return avgRating; }
    public Integer getReviewCount() { return reviewCount; }
}
