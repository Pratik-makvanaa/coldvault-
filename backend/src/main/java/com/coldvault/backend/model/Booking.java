package com.coldvault.backend.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String customer;
    private String farmerId;
    private String farmerPhone;
    private String farmerAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chamber_id")
    @JsonIgnoreProperties({"bookings", "hibernateLazyInitializer"})
    private Chamber chamber;

    private int slots;
    private int days;
    private double rentRate;
    private double totalPrice;
    private LocalDate startDate;
    private LocalDate endDate;
    private String createdAt;
    private LocalDate actualPickupDate;

    // NEW FIELD: "ACTIVE" | "CHECKED_OUT"
    // Differentiates who is currently using storage vs who has completed checkout.
    // After checkout, booking stays in DB for history but status = CHECKED_OUT.
    private String checkoutStatus = "ACTIVE";

    // ── Getters ──────────────────────────────────────────────────────────
    public Long getId()                    { return id; }
    public String getCustomer()            { return customer; }
    public String getFarmerId()            { return farmerId; }
    public String getFarmerPhone()         { return farmerPhone; }
    public String getFarmerAddress()       { return farmerAddress; }
    public Chamber getChamber()            { return chamber; }
    public int getSlots()                  { return slots; }
    public int getDays()                   { return days; }
    public double getRentRate()            { return rentRate; }
    public double getTotalPrice()          { return totalPrice; }
    public LocalDate getStartDate()        { return startDate; }
    public LocalDate getEndDate()          { return endDate; }
    public String getCreatedAt()           { return createdAt; }
    public LocalDate getActualPickupDate() { return actualPickupDate; }
    public String getCheckoutStatus()      { return checkoutStatus; }

    // ── Setters ──────────────────────────────────────────────────────────
    public void setId(Long id)                           { this.id = id; }
    public void setCustomer(String customer)             { this.customer = customer; }
    public void setFarmerId(String farmerId)             { this.farmerId = farmerId; }
    public void setFarmerPhone(String farmerPhone)       { this.farmerPhone = farmerPhone; }
    public void setFarmerAddress(String farmerAddress)   { this.farmerAddress = farmerAddress; }
    public void setChamber(Chamber chamber)              { this.chamber = chamber; }
    public void setSlots(int slots)                      { this.slots = slots; }
    public void setDays(int days)                        { this.days = days; }
    public void setRentRate(double rentRate)             { this.rentRate = rentRate; }
    public void setTotalPrice(double totalPrice)         { this.totalPrice = totalPrice; }
    public void setStartDate(LocalDate startDate)        { this.startDate = startDate; }
    public void setEndDate(LocalDate endDate)            { this.endDate = endDate; }
    public void setCreatedAt(String createdAt)           { this.createdAt = createdAt; }
    public void setActualPickupDate(LocalDate d)         { this.actualPickupDate = d; }
    public void setCheckoutStatus(String checkoutStatus) { this.checkoutStatus = checkoutStatus; }
}