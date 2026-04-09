package com.coldvault.backend.service;

import com.coldvault.backend.model.Booking;
import com.coldvault.backend.model.Chamber;
import com.coldvault.backend.repository.BookingRepository;
import com.coldvault.backend.repository.ChamberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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