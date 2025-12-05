package com.astra.repository;

import com.astra.model.SensorReading;
import com.astra.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    List<SensorReading> findByBatchOrderByTimestampDesc(Batch batch);
List<SensorReading> findTop50ByBoxIdOrderByTimestampDesc(String boxId);

    List<SensorReading> findByBoxIdAndTimestampBetweenOrderByTimestampAsc(
            String boxId,
            Instant from,
            Instant to
    );

    List<SensorReading> findAllByOrderByTimestampDesc();

    List<SensorReading> findByBoxIdOrderByTimestampDesc(String boxId);

    // 👉 REQUIRED for getLatestForBox()
    Optional<SensorReading> findTopByBoxIdOrderByTimestampDesc(String boxId);
}
