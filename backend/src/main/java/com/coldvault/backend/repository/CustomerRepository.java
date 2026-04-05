package com.coldvault.backend.repository;

import com.coldvault.backend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByAdminId(Long adminId);
    boolean existsByNameAndAdminId(String name, Long adminId);
}