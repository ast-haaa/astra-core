package com.astra.repository;

import java.util.Collection;
import com.astra.model.Alert;
import com.astra.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByBatchOrderByCreatedAtDesc(Batch batch);

    List<Alert> findByBoxIdAndStatus(String boxId, Alert.Status status);

    List<Alert> findByBoxIdIn(List<String> boxIds);

    // ❌ WRONG: findByBatchCode
    // FIXED:
    List<Alert> findByBatch_BatchCode(String batchCode);

    List<Alert> findByAssignedToAndStatusIn(String assignedTo, Collection<Alert.Status> statuses);

    List<Alert> findByStatusInAndDeadlineBeforeAndEscalated(
            Collection<Alert.Status> statuses,
            LocalDateTime before,
            boolean escalated
    );

    // For dashboard
    long countByBoxId(String boxId);
}
