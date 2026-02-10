package com.astra.repository;

import com.astra.model.Telemetry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TelemetryRepository extends JpaRepository<Telemetry, Long> {

Optional<Telemetry> findTopByBoxIdOrderByTimestampDesc(String boxId);
}
