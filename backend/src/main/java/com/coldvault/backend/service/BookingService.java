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

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ChamberRepository chamberRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        if (booking.getCreatedAt() == null || booking.getCreatedAt().isEmpty()) {
            booking.setCreatedAt(java.time.LocalDateTime.now().toString());
        }
        if (booking.getTotalPrice() == 0 && booking.getRentRate() > 0) {
            booking.setTotalPrice(
                    booking.getSlots() * booking.getDays() * booking.getRentRate()
            );
        }

        Booking saved = bookingRepository.save(booking);
        if (saved.getChamber() != null) {
            Chamber chamber = chamberRepository
                    .findById(saved.getChamber().getId())
                    .orElse(null);
            if (chamber != null) {
                chamber.setAvailableSlots(
                        Math.max(0, chamber.getAvailableSlots() - saved.getSlots())
                );
                chamberRepository.save(chamber);
            }
        }

        return saved;
    }

    // FIX 2: Checkout — handles early pickup (refund + free slots) and late pickup (extra charge)
    @Transactional
    public Map<String, Object> checkoutBooking(Long bookingId, LocalDate actualPickupDate) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        LocalDate bookedEndDate = booking.getEndDate();
        LocalDate startDate     = booking.getStartDate();
        double rentRate         = booking.getRentRate();
        int slots               = booking.getSlots();
        double originalTotal    = booking.getTotalPrice();

        // Actual days used inclusive (startDate to actualPickupDate)
        long actualDays = ChronoUnit.DAYS.between(startDate, actualPickupDate) + 1;
        if (actualDays < 1) actualDays = 1;

        double adjustedTotal = slots * actualDays * rentRate;
        // positive = late (farmer owes more), negative = early (farmer gets refund)
        long extraDays = ChronoUnit.DAYS.between(bookedEndDate, actualPickupDate);
        // positive = refund to farmer, negative = extra charge owed
        double refund = originalTotal - adjustedTotal;

        // Save updated booking
        booking.setActualPickupDate(actualPickupDate);
        booking.setDays((int) actualDays);
        booking.setTotalPrice(adjustedTotal);
        booking.setEndDate(actualPickupDate);
        bookingRepository.save(booking);

        // If farmer came EARLY: free the slots immediately so chamber can be reused
        if (extraDays < 0 && booking.getChamber() != null) {
            Chamber chamber = chamberRepository
                    .findById(booking.getChamber().getId())
                    .orElse(null);
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
        return result;
    }

    @Transactional
    public void deleteBooking(Long id) {

        Booking booking = bookingRepository.findById(id).orElse(null);

        if (booking != null) {
            if (booking.getChamber() != null) {
                Chamber chamber = chamberRepository
                        .findById(booking.getChamber().getId())
                        .orElse(null);
                if (chamber != null) {
                    chamber.setAvailableSlots(
                            chamber.getAvailableSlots() + booking.getSlots()
                    );
                    chamberRepository.save(chamber);
                }
            }
            bookingRepository.deleteById(id);
        }
    }
}