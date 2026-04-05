package com.coldvault.backend.controller;

import com.coldvault.backend.model.Customer;
import com.coldvault.backend.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    public List<Customer> getCustomers(@RequestParam Long adminId) {
        return customerService.getCustomersByAdmin(adminId);
    }

    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        if (customerService.nameExistsForAdmin(customer.getName(), customer.getAdminId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Customer already exists"));
        }
        return ResponseEntity.status(201).body(customerService.createCustomer(customer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}