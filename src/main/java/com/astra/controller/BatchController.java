package com.astra.controller;

import com.astra.api.dto.BatchDto;
import com.astra.model.*;
import com.astra.repository.*;
import com.astra.service.BoxReadingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/batch")
@RequiredArgsConstructor
public class BatchController {

    private final BatchRepository batchRepo;
    private final SensorReadingRepository sensorRepo;
    private final AlertRepository alertRepo;
    private final LabTestRepository labRepo;
    private final EventRepository eventRepo;
    private final BoxReadingsService boxReadingsService;

    // ✅ FULL TRACEABILITY REPORT API
    @GetMapping("/{batchCode}/trace-report")
    public ResponseEntity<?> getTraceReport(@PathVariable String batchCode) {

        Batch batch = batchRepo.findByBatchCode(batchCode).orElse(null);

        if (batch == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> report = new LinkedHashMap<>();

        // -------------------------
        // BASIC BATCH INFO
        // -------------------------
        report.put("batch", BatchDto.from(batch));

        // -------------------------
        // SHIPMENT STATUS
        // -------------------------
        report.put("shipmentStatus", batch.getShipmentStatus());

        // -------------------------
        // SENSOR HISTORY SUMMARY
        // -------------------------
        List<SensorReading> readings =
                sensorRepo.findTop50ByBoxIdOrderByTimestampDesc(batch.getBoxId());

        report.put("sensorReadingsCount", readings.size());

        if (!readings.isEmpty()) {
            SensorReading latest = readings.get(0);
            report.put("latestTemperature", latest.getTemperatureC());
            report.put("latestHumidity", latest.getHumidityPercent());
            report.put("lastSensorUpdate", latest.getTimestamp());
        }

        // -------------------------
        // ALERT HISTORY
        // -------------------------
        List<Alert> alerts = alertRepo.findByBatch_BatchCode(batchCode);
        report.put("alertsCount", alerts.size());

        // -------------------------
        // LAB TEST STATUS
        // -------------------------
        List<LabTest> labs = labRepo.findByBatchCode(batchCode);
        report.put("labTestsCount", labs.size());
        report.put("labResult", batch.getLabResult());

        // -------------------------
        // DEVICE EVENTS
        // -------------------------
        List<Event> events = eventRepo.findByBatchCode(batchCode);
        report.put("deviceEventsCount", events.size());

        // -------------------------
        // COLD CHAIN SCORE
        // -------------------------
        int coldChainScore = boxReadingsService.calculateColdChainScore(batch.getBoxId());
        report.put("coldChainScore", coldChainScore);

        // -------------------------
        // FINAL QUALITY SCORE
        // -------------------------
        int qualityScore = Math.max(0, Math.min(100,
                (int) (coldChainScore * 0.8 +
                       (alerts.size() == 0 ? 20 : 5))
        ));

        report.put("qualityScore", qualityScore);

        // -------------------------
        // SAFETY VERDICT
        // -------------------------
        String verdict =
                qualityScore >= 80 ? "SAFE" :
                qualityScore >= 55 ? "MODERATE" :
                "RISKY";

        report.put("verdict", verdict);

        // -------------------------
        // RECALL STATUS
        // -------------------------
        report.put("recalled", batch.getStatus() == BatchStatus.RECALLED);

        // -------------------------
        // AUDIT TRAIL COUNTS
        // -------------------------
        report.put("auditTrail", Map.of(
                "alerts", alerts.size(),
                "sensorReadings", readings.size(),
                "labTests", labs.size(),
                "events", events.size()
        ));

        return ResponseEntity.ok(report);
    }
}
