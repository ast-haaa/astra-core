package com.astra.controller;

import com.astra.model.Batch;
import com.astra.model.SensorReading;
import com.astra.repository.BatchRepository;
import com.astra.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
public class SensorReadingController {

    private final SensorReadingRepository sensorReadingRepository;
    private final BatchRepository batchRepository;

    @PostMapping("/reading")
    public ResponseEntity<?> saveReading(@RequestBody SensorReadingRequest req) {

        if (req.getBoxId() == null || req.getBatchCode() == null) {
            return ResponseEntity.badRequest().body("boxId and batchCode required");
        }

        Batch batch = batchRepository.findByBatchCode(req.getBatchCode())
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        SensorReading r = new SensorReading();
        r.setBoxId(req.getBoxId());
        r.setBatch(batch);
        r.setTemperatureC(req.getTemperature());
        r.setHumidityPercent(req.getHumidity());
        r.setGpsLat(req.getLatitude());
        r.setGpsLon(req.getLongitude());

        // FIX: use LocalDateTime (matches entity)
        r.setTimestamp(LocalDateTime.now());

        sensorReadingRepository.save(r);

        return ResponseEntity.ok("Reading saved");
    }

    public static class SensorReadingRequest {

        private String boxId;
        private String batchCode;
        private Double temperature;
        private Double humidity;
        private Double latitude;
        private Double longitude;

        public String getBoxId() { return boxId; }
        public void setBoxId(String boxId) { this.boxId = boxId; }

        public String getBatchCode() { return batchCode; }
        public void setBatchCode(String batchCode) { this.batchCode = batchCode; }

        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }

        public Double getHumidity() { return humidity; }
        public void setHumidity(Double humidity) { this.humidity = humidity; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }
}