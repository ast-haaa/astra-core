package com.astra.repository;

import com.astra.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByBatchCode(String batchCode);
    List<Batch> findByFarmerName(String farmerName);

    boolean existsByBatchCode(String batchCode);
}
