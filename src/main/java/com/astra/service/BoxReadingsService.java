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

    public List<BoxLatestReadingDto> getLatestReadings() {

        // ✅ LIMIT DB READ (performance)
        List<SensorReading> all =
                sensorReadingRepository.findTop200ByOrderByTimestampDesc();

        Map<String, SensorReading> latest = new LinkedHashMap<>();

        for (SensorReading r : all) {
            if (r.getBoxId() == null) continue;
            latest.putIfAbsent(r.getBoxId(), r);
        }

        return latest.values().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public BoxLatestReadingDto getLatestForBox(String boxId) {
        return sensorReadingRepository
                .findTopByBoxIdOrderByTimestampDesc(boxId)
                .map(this::mapToDto)
                .orElse(null);
    }

    private BoxLatestReadingDto mapToDto(SensorReading r) {

        BoxLatestReadingDto dto = new BoxLatestReadingDto();
        dto.setBoxId(r.getBoxId());

        // ✅ SAFE batch access
        dto.setBatchCode(
                r.getBatch() != null ? r.getBatch().getBatchCode() : "UNKNOWN"
        );

        dto.setTemperature(r.getTemperatureC());
        dto.setHumidity(r.getHumidityPercent());
        dto.setLatitude(r.getGpsLat());
        dto.setLongitude(r.getGpsLon());

        dto.setLocationName(
                locationService.getLocationLabel(
                        r.getGpsLat(),
                        r.getGpsLon()
                )
        );

        // ✅ FIX: Return LocalDateTime directly (UI wants readable time)
        if (r.getTimestamp() != null) {
            dto.setLastUpdatedAt(r.getTimestamp());
        }

        long openAlerts = alertRepository.countByBoxId(r.getBoxId());
        dto.setHasOpenAlerts(openAlerts > 0);

        dto.setPeltierState(
                locationService.getLatestPeltierState(r.getBoxId())
        );

        return dto;
    }

    public int calculateColdChainScore(String boxId) {

        List<SensorReading> readings =
                sensorReadingRepository.findTop50ByBoxIdOrderByTimestampDesc(boxId);

        if (readings == null || readings.isEmpty()) return 80;

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

        return Math.max(0, Math.min(100, score));
    }
}
