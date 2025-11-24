package com.astra.repository;

import com.astra.model.Telemetry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TelemetryRepository extends JpaRepository<Telemetry, Long> {
    List<Telemetry> findByBoxIdOrderByTimestampDesc(String boxId);
}
