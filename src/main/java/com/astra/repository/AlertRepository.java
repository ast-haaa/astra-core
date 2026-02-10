package com.astra.repository;

import java.util.Collection;
import com.astra.model.Alert;
import com.astra.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    
    boolean existsByBoxIdAndCreatedAtAfter(String boxId, LocalDateTime time);

    List<Alert> findByBatchOrderByCreatedAtDesc(Batch batch);

    List<Alert> findByBoxIdAndStatus(String boxId, Alert.Status status);

    List<Alert> findByBoxIdIn(List<String> boxIds);

    // ✅ FIXED farmer relation path
    List<Alert> findByBatch_Farmer_IdOrderByCreatedAtDesc(Long farmerId);

    List<Alert> findByBatch_BatchCode(String batchCode);

    List<Alert> findByAssignedToAndStatusIn(String assignedTo, Collection<Alert.Status> statuses);

    List<Alert> findByStatusInAndDeadlineBeforeAndEscalated(
            Collection<Alert.Status> statuses,
            LocalDateTime before,
            boolean escalated
    );

    long count();

    // ✅ FIXED count method
    long countByBatch_Farmer_Id(Long farmerId);

    long countByBoxId(String boxId);
}
