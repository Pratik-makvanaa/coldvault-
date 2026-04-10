package com.coldvault.backend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.coldvault.backend.model.Admin;
import com.coldvault.backend.repository.AdminRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    // SIGNUP
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Admin admin) {
        if (admin.getUsername() == null || admin.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }
        if (admin.getPassword() == null || admin.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }
        if (adminRepository.existsByUsername(admin.getUsername().trim())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
        }
        admin.setUsername(admin.getUsername().trim());
        Admin saved = adminRepository.save(admin);

        // Do NOT send password back on signup — App.jsx will use the typed password directly
        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("username", saved.getUsername());
        response.put("businessName", saved.getBusinessName());
        return ResponseEntity.status(201).body(response);
    }

    // LOGIN
    // FIX 3: Returns the admin's own password so the dashboard PasswordModal
    //         verifies using each admin's unique password, not a shared hardcoded one.
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        Optional<Admin> found = adminRepository.findByUsername(username);
        if (found.isEmpty() || !found.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
        Admin admin = found.get();
        Map<String, Object> response = new HashMap<>();
        response.put("id", admin.getId());
        response.put("username", admin.getUsername());
        response.put("businessName", admin.getBusinessName());
        // FIX 3: Include password so each admin's modal uses their own password
        response.put("password", admin.getPassword());
        return ResponseEntity.ok(response);
    }

    // Optional: server-side password check (useful for future API security upgrade)
    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        Optional<Admin> found = adminRepository.findByUsername(username);
        if (found.isEmpty() || !found.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("verified", false, "error", "Incorrect password"));
        }
        return ResponseEntity.ok(Map.of("verified", true));
    }
}