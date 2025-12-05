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
    // ❌ REMOVED self-reference that caused circular dependency
    // private final BoxReadingsService boxReadingsService;

    // -------------------------------------------------
    // 1) Latest readings for ALL boxes
    // -------------------------------------------------
    public List<BoxLatestReadingDto> getLatestReadings() {

        List<SensorReading> all = sensorReadingRepository.findAllByOrderByTimestampDesc();

        Map<String, SensorReading> latest = new LinkedHashMap<>();

        for (SensorReading r : all) {
            if (r.getBoxId() == null) continue;
            latest.putIfAbsent(r.getBoxId(), r);
        }

        return latest.values()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------
    // 2) Latest reading for ONE box
    // -------------------------------------------------
    public BoxLatestReadingDto getLatestForBox(String boxId) {

        Optional<SensorReading> readingOpt =
                sensorReadingRepository.findTopByBoxIdOrderByTimestampDesc(boxId);

        return readingOpt.map(this::mapToDto).orElse(null);
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

        String loc = locationService.getLocationLabel(
                r.getGpsLat(),
                r.getGpsLon()
        );
        dto.setLocationName(loc);

        dto.setLastUpdatedAt(r.getTimestamp());

        long openAlerts = alertRepository.countByBoxId(r.getBoxId());
        dto.setHasOpenAlerts(openAlerts > 0);

        String peltierState = locationService.getLatestPeltierState(r.getBoxId());
        dto.setPeltierState(peltierState);

        return dto;
    }

    // ---------------------------------------------------------
    // NEW: Cold Chain Score (0–100)
    // ---------------------------------------------------------
    public int calculateColdChainScore(String boxId) {

        List<SensorReading> readings =
                sensorReadingRepository.findTop50ByBoxIdOrderByTimestampDesc(boxId);

        if (readings == null || readings.isEmpty()) {
            return 80;
        }

        int score = 100;

        for (SensorReading r : readings) {

            Double t = r.getTemperatureC();
            Double h = r.getHumidityPercent();

            if (t != null) {
                if (t < 15 || t > 35) score -= 8;
                else if (t < 18 || t > 28) score -= 4;
            }

            if (h != null) {
                if (h < 30 || h > 80) score -= 8;
                else if (h < 40 || h > 65) score -= 4;
            }
        }

        if (score < 0) score = 0;
        if (score > 100) score = 100;

        return score;
    }

}
