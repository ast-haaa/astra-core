package com.astra.repository;

import com.astra.model.Alert;
import com.astra.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByBatchOrderByCreatedAtDesc(Batch batch);

    List<Alert> findByBoxIdAndStatus(String boxId, Alert.Status status);
    
      List<Alert> findByBatchCode(String batchCode);
    // 🔥 NEW — count alerts for dashboard
    long countByBoxId(String boxId);
}
