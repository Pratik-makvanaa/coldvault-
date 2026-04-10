package com.coldvault.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.coldvault.backend.model.Booking;
import com.coldvault.backend.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        Booking saved = bookingService.createBooking(booking);
        return ResponseEntity.status(201).body(saved);
    }

    // FIX 2: Checkout endpoint — early pickup frees slots + recalculates bill,
    //         late pickup charges extra days at same rate
    @PostMapping("/{id}/checkout")
    public ResponseEntity<?> checkoutBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String dateStr = body.get("actualPickupDate");
            if (dateStr == null || dateStr.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "actualPickupDate is required"));
            }
            LocalDate actualPickupDate = LocalDate.parse(dateStr);
            Map<String, Object> result = bookingService.checkoutBooking(id, actualPickupDate);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public void deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
    }
}