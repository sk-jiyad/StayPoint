package com.jiyad.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
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

    @Column(nullable = false)
    private Long ownerUserId;

    // Constructors, getters, and setters
    public PG() {}
    
    // Add all getters and setters here
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

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

	public Long getOwnerUserId() {
		return ownerUserId;
	}

	public void setOwnerUserId(Long ownerUserId) {
		this.ownerUserId = ownerUserId;
	}

    // Continue with all other getters and setters...
    
}

