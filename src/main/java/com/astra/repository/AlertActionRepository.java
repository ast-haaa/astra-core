package com.astra.repository;

import com.astra.model.AlertAction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertActionRepository extends JpaRepository<AlertAction, Long> {
    List<AlertAction> findByAlertId(Long alertId);
    List<AlertAction> findByBatchCode(String batchCode);
}
