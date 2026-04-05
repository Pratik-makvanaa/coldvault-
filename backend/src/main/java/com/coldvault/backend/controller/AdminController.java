package com.coldvault.backend.controller;

import com.coldvault.backend.model.Admin;
import com.coldvault.backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

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
        saved.setPassword(null); // don't send password back
        return ResponseEntity.status(201).body(saved);
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        Optional<Admin> found = adminRepository.findByUsername(username);
        if (found.isEmpty() || !found.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
        Admin admin = found.get();
        admin.setPassword(null);
        return ResponseEntity.ok(admin);
    }
}