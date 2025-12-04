package com.astra.api.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class DashboardSummaryDto {
    private long boxesCount;
    private long activeAlerts;
    private Double avgTemperature;
    private Double avgHumidity;
    private Instant lastUpdatedAt;
}
