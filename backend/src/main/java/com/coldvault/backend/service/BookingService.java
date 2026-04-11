package com.coldvault.backend.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.coldvault.backend.model.Booking;
import com.coldvault.backend.model.Chamber;
import com.coldvault.backend.repository.BookingRepository;
import com.coldvault.backend.repository.ChamberRepository;

@Service
public class BookingService {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private ChamberRepository chamberRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        if (booking.getCreatedAt() == null || booking.getCreatedAt().isEmpty()) {
            booking.setCreatedAt(java.time.LocalDateTime.now().toString());
        }
        if (booking.getTotalPrice() == 0 && booking.getRentRate() > 0) {
            booking.setTotalPrice(booking.getSlots() * booking.getDays() * booking.getRentRate());
        }
        // New bookings always start as ACTIVE
        booking.setCheckoutStatus("ACTIVE");

        Booking saved = bookingRepository.save(booking);

        // Reduce available slots in the chamber
        if (saved.getChamber() != null) {
            Chamber chamber = chamberRepository.findById(saved.getChamber().getId()).orElse(null);
            if (chamber != null) {
                chamber.setAvailableSlots(Math.max(0, chamber.getAvailableSlots() - saved.getSlots()));
                chamberRepository.save(chamber);
            }
        }
        return saved;
    }

    /**
     * Checkout — marks booking as CHECKED_OUT (keeps it in DB for history/all-bookings page).
     * Always restores slots to chamber (so others can book).
     * Recalculates bill for early/late pickup.
     */
    @Transactional
    public Map<String, Object> checkoutBooking(Long bookingId, LocalDate actualPickupDate) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if ("CHECKED_OUT".equals(booking.getCheckoutStatus())) {
            throw new RuntimeException("Booking already checked out");
        }

        LocalDate bookedEndDate = booking.getEndDate();
        LocalDate startDate     = booking.getStartDate();
        double rentRate         = booking.getRentRate();
        int slots               = booking.getSlots();
        double originalTotal    = booking.getTotalPrice();

        long actualDays = ChronoUnit.DAYS.between(startDate, actualPickupDate) + 1;
        if (actualDays < 1) actualDays = 1;

        double adjustedTotal = slots * actualDays * rentRate;
        long extraDays = ChronoUnit.DAYS.between(bookedEndDate, actualPickupDate);
        double refund = originalTotal - adjustedTotal;

        // Update booking — mark as CHECKED_OUT (stays in DB for analytics)
        booking.setActualPickupDate(actualPickupDate);
        booking.setDays((int) actualDays);
        booking.setTotalPrice(adjustedTotal);
        booking.setEndDate(actualPickupDate);
        booking.setCheckoutStatus("CHECKED_OUT");  // ← KEY CHANGE: marks as done
        bookingRepository.save(booking);

        // Always restore slots on checkout (chamber capacity freed)
        if (booking.getChamber() != null) {
            Chamber chamber = chamberRepository.findById(booking.getChamber().getId()).orElse(null);
            if (chamber != null) {
                chamber.setAvailableSlots(chamber.getAvailableSlots() + slots);
                chamberRepository.save(chamber);
            }
        }

        String status;
        if (extraDays > 0)      status = "LATE";
        else if (extraDays < 0) status = "EARLY";
        else                    status = "ON_TIME";

        Map<String, Object> result = new HashMap<>();
        result.put("bookingId",        bookingId);
        result.put("customer",         booking.getCustomer());
        result.put("farmerId",         booking.getFarmerId());
        result.put("slots",            slots);
        result.put("rentRate",         rentRate);
        result.put("startDate",        startDate.toString());
        result.put("bookedEndDate",    bookedEndDate.toString());
        result.put("actualPickupDate", actualPickupDate.toString());
        result.put("adjustedDays",     (int) actualDays);
        result.put("originalTotal",    originalTotal);
        result.put("adjustedTotal",    adjustedTotal);
        result.put("extraDays",        (int) extraDays);
        result.put("refund",           refund);
        result.put("status",           status);
        result.put("checkoutStatus",   "CHECKED_OUT");
        return result;
    }

    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking != null) {
            // Restore slots only if still ACTIVE (not already checked out)
            if (!"CHECKED_OUT".equals(booking.getCheckoutStatus()) && booking.getChamber() != null) {
                Chamber chamber = chamberRepository.findById(booking.getChamber().getId()).orElse(null);
                if (chamber != null) {
                    chamber.setAvailableSlots(chamber.getAvailableSlots() + booking.getSlots());
                    chamberRepository.save(chamber);
                }
            }
            bookingRepository.deleteById(id);
        }
    }
}