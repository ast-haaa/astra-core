package com.astra.repository;

import com.astra.model.SensorReading;
import com.astra.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    List<SensorReading> findByBatchOrderByTimestampDesc(Batch batch);

    List<SensorReading> findByBoxIdAndTimestampBetweenOrderByTimestampAsc(
            String boxId,
            Instant from,
            Instant to
    );
     List<SensorReading> findAllByOrderByTimestampDesc();

    // Optional: single box ke latest readings (future use)
    List<SensorReading> findByBoxIdOrderByTimestampDesc(String boxId);

    
}
