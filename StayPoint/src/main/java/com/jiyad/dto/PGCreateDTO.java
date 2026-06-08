package com.jiyad.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class PGCreateDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Owner name is required")
    @Size(min = 2, max = 100)
    private String ownerName;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "\\d{10}", message = "Contact number must be 10 digits")
    private String contactNumber;

    @Pattern(regexp = "\\d{10}", message = "Alternate contact must be 10 digits")
    private String alternateContact;

    @NotBlank(message = "Address is required")
    @Size(min = 10, max = 500)
    private String address;

    @Size(max = 200)
    private String landmark;

    @NotNull(message = "Single rent is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rent must be positive")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal rentSingle;

    @NotNull(message = "Double rent is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rent must be positive")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal rentDouble;

    @DecimalMin(value = "0.0", inclusive = false, message = "Rent must be positive")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal rentTriple;

    @NotNull(message = "foodProvided is required")
    private Boolean foodProvided;

    @NotNull(message = "wifiAvailable is required")
    private Boolean wifiAvailable;

    @NotNull(message = "acAvailable is required")
    private Boolean acAvailable;

    @Size(max = 8, message = "At most 8 images")
    private List<String> imageUrls;

    @Pattern(regexp = "boys|girls|coed", message = "Gender must be boys, girls or coed")
    private String gender;

    @PositiveOrZero
    private Integer totalRooms;

    @PositiveOrZero
    private Integer availableRooms;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getAlternateContact() { return alternateContact; }
    public void setAlternateContact(String alternateContact) { this.alternateContact = alternateContact; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public BigDecimal getRentSingle() { return rentSingle; }
    public void setRentSingle(BigDecimal rentSingle) { this.rentSingle = rentSingle; }

    public BigDecimal getRentDouble() { return rentDouble; }
    public void setRentDouble(BigDecimal rentDouble) { this.rentDouble = rentDouble; }

    public BigDecimal getRentTriple() { return rentTriple; }
    public void setRentTriple(BigDecimal rentTriple) { this.rentTriple = rentTriple; }

    public Boolean getFoodProvided() { return foodProvided; }
    public void setFoodProvided(Boolean foodProvided) { this.foodProvided = foodProvided; }

    public Boolean getWifiAvailable() { return wifiAvailable; }
    public void setWifiAvailable(Boolean wifiAvailable) { this.wifiAvailable = wifiAvailable; }

    public Boolean getAcAvailable() { return acAvailable; }
    public void setAcAvailable(Boolean acAvailable) { this.acAvailable = acAvailable; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Integer getTotalRooms() { return totalRooms; }
    public void setTotalRooms(Integer totalRooms) { this.totalRooms = totalRooms; }

    public Integer getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(Integer availableRooms) { this.availableRooms = availableRooms; }
}
