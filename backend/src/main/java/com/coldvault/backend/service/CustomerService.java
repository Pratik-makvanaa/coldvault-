package com.coldvault.backend.service;

import com.coldvault.backend.model.Customer;
import com.coldvault.backend.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getCustomersByAdmin(Long adminId) {
        return customerRepository.findByAdminId(adminId);
    }

    public boolean nameExistsForAdmin(String name, Long adminId) {
        return customerRepository.existsByNameAndAdminId(name, adminId);
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }
}