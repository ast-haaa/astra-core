package com.astra.repository;

import com.astra.model.TelemetrySnapshot;
import com.astra.repository.projection.BoxSnapshotSummary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TelemetrySnapshotRepository extends JpaRepository<TelemetrySnapshot, String> {

    // Latest snapshot for single box
    Optional<TelemetrySnapshot> findTopByBoxIdOrderByTimestampDesc(String boxId);

    // For offline-box scheduler
    @Query("""
           SELECT ts.boxId, MAX(ts.timestamp)
           FROM TelemetrySnapshot ts
           GROUP BY ts.boxId
           """)
    List<Object[]> getLatestSnapshotTimes();

    // Group all boxes with their last timestamps
    @Query("""
           SELECT t.boxId AS boxId,
                  MAX(t.timestamp) AS lastTimestamp
           FROM TelemetrySnapshot t
           GROUP BY t.boxId
           """)
    List<BoxSnapshotSummary> findAllGrouped();

    List<TelemetrySnapshot> findTop5ByBoxIdOrderByTimestampDesc(String boxId);

@Query("SELECT DISTINCT t.boxId FROM TelemetrySnapshot t")
List<String> findDistinctBoxIds();

@Query("SELECT t.boxId, MAX(t.timestamp) FROM TelemetrySnapshot t GROUP BY t.boxId")
List<Object[]> findLastSeenForAllBoxes();


}
