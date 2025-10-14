package com.astra.repository;

import com.astra.model.TelemetrySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TelemetrySnapshotRepository extends JpaRepository<TelemetrySnapshot, String> {
    Optional<TelemetrySnapshot> findTopByBoxIdOrderByTimestampDesc(String boxId);
}
