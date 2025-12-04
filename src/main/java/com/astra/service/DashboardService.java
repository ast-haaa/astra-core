package com.astra.service;

import com.astra.api.dto.DashboardSummaryDto;
import com.astra.model.SensorReading;
import com.astra.repository.AlertRepository;
import com.astra.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SensorReadingRepository sensorRepo;
    private final AlertRepository alertRepo;

    public DashboardSummaryDto getSummary() {

        DashboardSummaryDto dto = new DashboardSummaryDto();

        // 1) Always 2 boxes (MVP fixed)
        dto.setBoxesCount(2);

        // 2) Active alerts
        long alerts = alertRepo.count(); // you can filter by OPEN if needed
        dto.setActiveAlerts(alerts);

        // 3) Latest readings for calculating average
        List<SensorReading> latest = sensorRepo.findAllByOrderByTimestampDesc();

        if (!latest.isEmpty()) {
            double avgTemp = latest.stream()
                    .mapToDouble(r -> r.getTemperatureC() != null ? r.getTemperatureC() : 0)
                    .average()
                    .orElse(0);

            double avgHum = latest.stream()
                    .mapToDouble(r -> r.getHumidityPercent() != null ? r.getHumidityPercent() : 0)
                    .average()
                    .orElse(0);

            dto.setAvgTemperature(avgTemp);
            dto.setAvgHumidity(avgHum);

            dto.setLastUpdatedAt(latest.get(0).getTimestamp());
        }

        return dto;
    }
}
