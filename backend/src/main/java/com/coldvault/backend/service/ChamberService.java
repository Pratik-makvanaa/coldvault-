package com.coldvault.backend.service;

import com.coldvault.backend.model.Chamber;
import com.coldvault.backend.repository.ChamberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChamberService {

    @Autowired
    private ChamberRepository chamberRepository;

    public List<Chamber> getChambersByAdmin(Long adminId) {
        return chamberRepository.findByAdminId(adminId);
    }

    public boolean nameExistsForAdmin(String name, Long adminId) {
        return chamberRepository.existsByNameAndAdminId(name, adminId);
    }

    public Chamber createChamber(Chamber chamber) {
        if (chamber.getAvailableSlots() == 0) {
            chamber.setAvailableSlots(chamber.getTotalSlots());
        }
        return chamberRepository.save(chamber);
    }

    public void deleteChamber(Long id) {
        chamberRepository.deleteById(id);
    }
}