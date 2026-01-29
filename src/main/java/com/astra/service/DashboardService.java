package com.astra.service;

import com.astra.api.dto.DashboardSummaryDto;
import com.astra.model.SensorReading;
import com.astra.repository.AlertRepository;
import com.astra.repository.BoxRepository;
import com.astra.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SensorReadingRepository sensorRepo;
    private final AlertRepository alertRepo;
    private final BoxRepository boxRepo;

    public DashboardSummaryDto getSummaryForFarmer(Long farmerId) {

        DashboardSummaryDto dto = new DashboardSummaryDto();

        dto.setBoxesCount(boxRepo.countByFarmer_Id(farmerId));
        dto.setActiveAlerts(alertRepo.countByBatch_Farmer_Id(farmerId));

        List<SensorReading> latest = sensorRepo.findLatestReadingsByFarmer(farmerId);

        if (!latest.isEmpty()) {

            dto.setAvgTemperature(
                latest.stream()
                      .mapToDouble(r -> r.getTemperatureC() != null ? r.getTemperatureC() : 0)
                      .average()
                      .orElse(0)
            );

            dto.setAvgHumidity(
                latest.stream()
                      .mapToDouble(r -> r.getHumidityPercent() != null ? r.getHumidityPercent() : 0)
                      .average()
                      .orElse(0)
            );

            if (latest.get(0).getTimestamp() != null) {
                dto.setLastUpdatedAt(
                    latest.get(0).getTimestamp()
                          .atZone(ZoneId.of("Asia/Kolkata"))
                          .toInstant()
                );
            }
        }

        return dto;
    }
}