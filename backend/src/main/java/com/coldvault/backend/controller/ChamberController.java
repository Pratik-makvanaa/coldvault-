package com.coldvault.backend.controller;

import com.coldvault.backend.model.Chamber;
import com.coldvault.backend.service.ChamberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chambers")
@CrossOrigin(origins = "*")
public class ChamberController {

    @Autowired
    private ChamberService chamberService;

    @GetMapping
    public List<Chamber> getChambers(@RequestParam Long adminId) {
        return chamberService.getChambersByAdmin(adminId);
    }

    @PostMapping
    public ResponseEntity<?> createChamber(@RequestBody Chamber chamber) {
        // Validate: no duplicate name for same admin
        if (chamberService.nameExistsForAdmin(chamber.getName(), chamber.getAdminId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chamber with this name already exists"));
        }
        return ResponseEntity.status(201).body(chamberService.createChamber(chamber));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChamber(@PathVariable Long id) {
        chamberService.deleteChamber(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}