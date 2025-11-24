package com.astra.service;

import com.astra.api.dto.BoxLatestReadingDto;
import com.astra.model.SensorReading;
import com.astra.repository.AlertRepository;
import com.astra.repository.SensorReadingRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BoxReadingsService {

    private final SensorReadingRepository sensorReadingRepository;
    private final AlertRepository alertRepository;
    private final LocationService locationService;

    public BoxReadingsService(SensorReadingRepository sensorReadingRepository,
                              AlertRepository alertRepository,
                              LocationService locationService) {
        this.sensorReadingRepository = sensorReadingRepository;
        this.alertRepository = alertRepository;
        this.locationService = locationService;
    }

    public List<BoxLatestReadingDto> getLatestReadings() {

        // 1) Fetch all readings sorted newest-first
        List<SensorReading> allReadings = sensorReadingRepository.findAllByOrderByTimestampDesc();

        // 2) Pick the latest reading per boxId
        Map<String, SensorReading> latestPerBox = new LinkedHashMap<>();
        for (SensorReading r : allReadings) {
            if (r.getBoxId() == null) continue;
            latestPerBox.putIfAbsent(r.getBoxId(), r); // only first (latest)
        }

        // 3) Convert to DTO list
        return latestPerBox.values()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private BoxLatestReadingDto mapToDto(SensorReading reading) {
        BoxLatestReadingDto dto = new BoxLatestReadingDto();

        dto.setBoxId(reading.getBoxId());

        if (reading.getBatch() != null) {
            dto.setBatchCode(reading.getBatch().getBatchCode());
        }

        dto.setTemperature(reading.getTemperatureC());
        dto.setHumidity(reading.getHumidityPercent());
        dto.setVoc(reading.getVocPpm());

        dto.setLatitude(reading.getGpsLat());
        dto.setLongitude(reading.getGpsLon());

        // Real reverse geocoding
        String location = locationService.getLocationLabel(
                reading.getGpsLat(),
                reading.getGpsLon()
        );
        dto.setLocationName(location);

        dto.setLastUpdatedAt(reading.getTimestamp());

        long openAlertCount = alertRepository.countByBoxId(reading.getBoxId());
        dto.setHasOpenAlerts(openAlertCount > 0);

        return dto;
    }
}
