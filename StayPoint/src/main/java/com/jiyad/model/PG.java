package com.jiyad.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pgs")
public class PG {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String ownerName;

    @Column(nullable = false)
    private String contactNumber;

    private String alternateContact;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    private String landmark;

    @Column(nullable = false)
    private BigDecimal rentSingle;

    @Column(nullable = false)
    private BigDecimal rentDouble;

    private BigDecimal rentTriple;

    @Column(nullable = false)
    private Boolean foodProvided;

    @Column(nullable = false)
    private Boolean wifiAvailable;

    @Column(nullable = false)
    private Boolean acAvailable;

    // boys | girls | coed (nullable for listings created before this field existed)
    private String gender;

    private Integer totalRooms;

    private Integer availableRooms;

    @Column(nullable = false)
    private Long ownerUserId;

    @ElementCollection
    @CollectionTable(name = "pg_images", joinColumns = @JoinColumn(name = "pg_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    // Admin-set trust flag (nullable for rows created before this field existed -> treat null as false)
    private Boolean verified;

    // Nearby college this PG is convenient for (powers "search by college" + recommendation proximity)
    private String nearbyCollege;

    private Boolean laundryAvailable;

    private Boolean parkingAvailable;

    private Boolean attachedBathroom;

    // Denormalised from reviews so listing/recommendation reads stay cheap (recomputed by ReviewService)
    private Double avgRating;

    private Integer reviewCount;

    // Constructors, getters, and setters
    public PG() {
    }

    // Add all getters and setters here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getAlternateContact() {
        return alternateContact;
    }

    public void setAlternateContact(String alternateContact) {
        this.alternateContact = alternateContact;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLandmark() {
        return landmark;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    public BigDecimal getRentSingle() {
        return rentSingle;
    }

    public void setRentSingle(BigDecimal rentSingle) {
        this.rentSingle = rentSingle;
    }

    public BigDecimal getRentDouble() {
        return rentDouble;
    }

    public void setRentDouble(BigDecimal rentDouble) {
        this.rentDouble = rentDouble;
    }

    public BigDecimal getRentTriple() {
        return rentTriple;
    }

    public void setRentTriple(BigDecimal rentTriple) {
        this.rentTriple = rentTriple;
    }

    public Boolean getFoodProvided() {
        return foodProvided;
    }

    public void setFoodProvided(Boolean foodProvided) {
        this.foodProvided = foodProvided;
    }

    public Boolean getWifiAvailable() {
        return wifiAvailable;
    }

    public void setWifiAvailable(Boolean wifiAvailable) {
        this.wifiAvailable = wifiAvailable;
    }

    public Boolean getAcAvailable() {
        return acAvailable;
    }

    public void setAcAvailable(Boolean acAvailable) {
        this.acAvailable = acAvailable;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Integer getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(Integer totalRooms) {
        this.totalRooms = totalRooms;
    }

    public Integer getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(Integer availableRooms) {
        this.availableRooms = availableRooms;
    }

    public Long getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(Long ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public String getNearbyCollege() {
        return nearbyCollege;
    }

    public void setNearbyCollege(String nearbyCollege) {
        this.nearbyCollege = nearbyCollege;
    }

    public Boolean getLaundryAvailable() {
        return laundryAvailable;
    }

    public void setLaundryAvailable(Boolean laundryAvailable) {
        this.laundryAvailable = laundryAvailable;
    }

    public Boolean getParkingAvailable() {
        return parkingAvailable;
    }

    public void setParkingAvailable(Boolean parkingAvailable) {
        this.parkingAvailable = parkingAvailable;
    }

    public Boolean getAttachedBathroom() {
        return attachedBathroom;
    }

    public void setAttachedBathroom(Boolean attachedBathroom) {
        this.attachedBathroom = attachedBathroom;
    }

    public Double getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(Double avgRating) {
        this.avgRating = avgRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

}

