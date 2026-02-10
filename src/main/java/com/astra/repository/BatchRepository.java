package com.astra.repository;

import com.astra.model.Batch;
import com.astra.model.BatchStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByBatchCode(String batchCode);

    List<Batch> findAllByBoxIdOrderByCreatedAtDesc(String boxId);
 // ✅ ADD THIS

    List<Batch> findByFarmerId(Long farmerId);

    List<Batch> findByStatus(BatchStatus status);

    List<Batch> findByStatusIn(List<BatchStatus> statuses);

    long countByStatus(BatchStatus status);

    boolean existsByBatchCode(String batchCode);

    long countByFarmerIdAndStatus(Long farmerId, BatchStatus status);
}
