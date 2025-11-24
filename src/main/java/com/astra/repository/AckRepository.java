package com.astra.repository;

import com.astra.model.AckRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AckRepository extends JpaRepository<AckRecord, Long> {
    List<AckRecord> findByBoxIdOrderByTimestampDesc(String boxId);
}
