package com.coldvault.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;


@Entity
@Table(name = "chambers")
public class Chamber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int totalSlots;
    private int availableSlots;
    private double pricePerSlotPerDay;
    private double temperature;
    private Long adminId;
    @OneToMany(mappedBy = "chamber", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"chamber"})
    private List<Booking> bookings = new ArrayList<>();

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public int getTotalSlots() { return totalSlots; }
    public int getAvailableSlots() { return availableSlots; }
    public double getPricePerSlotPerDay() { return pricePerSlotPerDay; }
    public double getTemperature() { return temperature; }
    public List<Booking> getBookings() { return bookings; }
    public Long getAdminId() { return adminId; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setTotalSlots(int totalSlots) { this.totalSlots = totalSlots; }
    public void setAvailableSlots(int availableSlots) { this.availableSlots = availableSlots; }
    public void setPricePerSlot(double pricePerSlot) { this.pricePerSlotPerDay = pricePerSlot; }
    public void setTemperature(double temperature) { this.temperature = temperature; }
    public void setBookings(List<Booking> bookings) { this.bookings = bookings; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

}
