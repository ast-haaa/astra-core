package com.astra.repository;

import com.astra.model.SensorReading;
import com.astra.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    List<SensorReading> findByBatchOrderByTimestampDesc(Batch batch);

    List<SensorReading> findTop50ByBoxIdOrderByTimestampDesc(String boxId);
    
    List<SensorReading> findTop200ByOrderByTimestampDesc();

    List<SensorReading> findByBoxIdAndTimestampBetweenOrderByTimestampAsc(
            String boxId,
            Instant from,
            Instant to
    );

    List<SensorReading> findAllByOrderByTimestampDesc();

    @Query("""
        SELECT sr 
        FROM SensorReading sr 
        WHERE sr.batch.farmer.id = :farmerId
        ORDER BY sr.timestamp DESC
    """)
    List<SensorReading> findLatestReadingsByFarmer(@Param("farmerId") Long farmerId);

    List<SensorReading> findByBoxIdOrderByTimestampDesc(String boxId);

    Optional<SensorReading> findTopByBoxIdOrderByTimestampDesc(String boxId);

    // ✅ ONLY TULSI SENSOR DATA
   @Query("""
SELECT sr 
FROM SensorReading sr 
LEFT JOIN FETCH sr.batch 
WHERE sr.batch.id = 3
ORDER BY sr.timestamp DESC
""")
List<SensorReading> findTulsiOnly();

}

