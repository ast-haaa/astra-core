package com.astra.repository;

import com.astra.model.Box;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BoxRepository extends JpaRepository<Box, String> {

    long countByFarmer_Id(Long farmerId);

    List<Box> findByFarmer_Id(Long farmerId);

    long count();
}
