package com.astra.service;

import com.astra.api.dto.BoxLatestReadingDto;
import com.astra.model.SensorReading;
import com.astra.repository.AlertRepository;
import com.astra.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoxReadingsService {

    private final SensorReadingRepository sensorReadingRepository;
    private final AlertRepository alertRepository;
    private final LocationService locationService;

    // -------------------------------------------------
    // 1) Latest readings for ALL boxes
    // -------------------------------------------------
    public List<BoxLatestReadingDto> getLatestReadings() {

        // Fetch all readings sorted by newest first
        List<SensorReading> all = sensorReadingRepository.findAllByOrderByTimestampDesc();

        // Pick latest reading per box
        Map<String, SensorReading> latest = new LinkedHashMap<>();

        for (SensorReading r : all) {
            if (r.getBoxId() == null) continue;
            latest.putIfAbsent(r.getBoxId(), r); // first = latest because sorted desc
        }

        // Convert to DTO
        return latest.values()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------
    // 2) Latest reading for ONE box
    // -------------------------------------------------
    public BoxLatestReadingDto getLatestForBox(String boxId) {

        // fetch latest 1 reading for box
        Optional<SensorReading> readingOpt =
                sensorReadingRepository.findTopByBoxIdOrderByTimestampDesc(boxId);

        return readingOpt.map(this::mapToDto)
                .orElse(null); // frontend handles empty result
    }

    // -------------------------------------------------
    // Converter
    // -------------------------------------------------
    private BoxLatestReadingDto mapToDto(SensorReading r) {

        BoxLatestReadingDto dto = new BoxLatestReadingDto();

        dto.setBoxId(r.getBoxId());

        if (r.getBatch() != null) {
            dto.setBatchCode(r.getBatch().getBatchCode());
        }

        dto.setTemperature(r.getTemperatureC());
        dto.setHumidity(r.getHumidityPercent());

        dto.setLatitude(r.getGpsLat());
        dto.setLongitude(r.getGpsLon());

        // Reverse Geocoding
        String loc = locationService.getLocationLabel(
                r.getGpsLat(),
                r.getGpsLon()
        );
        dto.setLocationName(loc);

        dto.setLastUpdatedAt(r.getTimestamp());

        // Count open alerts
        long openAlerts = alertRepository.countByBoxId(r.getBoxId());
        dto.setHasOpenAlerts(openAlerts > 0);

        // Latest peltier state
        String peltierState = locationService.getLatestPeltierState(r.getBoxId());
        dto.setPeltierState(peltierState);

        return dto;
    }
}
