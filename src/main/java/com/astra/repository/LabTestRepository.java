package com.astra.repository;

import com.astra.model.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabTestRepository extends JpaRepository<LabTest, Long> {
    List<LabTest> findByBatchCodeOrderByCreatedAtDesc(String batchCode);
}
