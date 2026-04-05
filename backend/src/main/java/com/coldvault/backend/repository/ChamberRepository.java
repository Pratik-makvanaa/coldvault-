package com.coldvault.backend.repository;

import com.coldvault.backend.model.Chamber;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChamberRepository extends JpaRepository<Chamber, Long> {
    List<Chamber> findByAdminId(Long adminId);
    boolean existsByNameAndAdminId(String name, Long adminId);
}