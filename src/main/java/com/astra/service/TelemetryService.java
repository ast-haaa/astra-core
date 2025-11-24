package com.astra.service;

import com.astra.api.dto.TelemetryMessageDto;
import com.astra.model.Alert;
import com.astra.model.Batch;
import com.astra.model.SensorReading;
import com.astra.model.Telemetry;
import com.astra.repository.AlertRepository;
import com.astra.repository.BatchRepository;
import com.astra.repository.SensorReadingRepository;
import com.astra.repository.TelemetryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class TelemetryService {

    private static final Logger log = LoggerFactory.getLogger(TelemetryService.class);

    private final TelemetryRepository telemetryRepository;
    private final BatchRepository batchRepository;
    private final SensorReadingRepository sensorReadingRepository;
    private final AlertRepository alertRepository;

    public TelemetryService(TelemetryRepository telemetryRepository,
                            BatchRepository batchRepository,
                            SensorReadingRepository sensorReadingRepository,
                            AlertRepository alertRepository) {
        this.telemetryRepository = telemetryRepository;
        this.batchRepository = batchRepository;
        this.sensorReadingRepository = sensorReadingRepository;
        this.alertRepository = alertRepository;
    }

    // ==== OLD API logic (keep as-is) ====

    public Telemetry save(Telemetry t) {
        return telemetryRepository.save(t);
    }

    public List<Telemetry> findByBoxId(String boxId) {
        return telemetryRepository.findByBoxIdOrderByTimestampDesc(boxId);
    }

    // ==== NEW MQTT / Batch / Sensor / Alerts logic ====

    @Transactional
    public void handleTelemetry(TelemetryMessageDto dto) {
        // 1) Find or create batch
        Batch batch = batchRepository.findByBatchCode(dto.getBatchCode())
                .orElseGet(() -> {
                    Batch b = new Batch();
                    b.setBatchCode(dto.getBatchCode());
                    b.setHerbName("UNKNOWN");      // can update later via UI
                    b.setFarmerName(null);
                    b.setOriginLocation(null);
                    log.info("Created new batch for batchCode={}", dto.getBatchCode());
                    return batchRepository.save(b);
                });

        // 2) Build SensorReading
        SensorReading reading = new SensorReading();
        reading.setBatch(batch);
        reading.setBoxId(dto.getBoxId());

        Instant ts = dto.getTimestampEpochMillis() != null
                ? Instant.ofEpochMilli(dto.getTimestampEpochMillis())
                : Instant.now();
        reading.setTimestamp(ts);

        reading.setTemperatureC(dto.getTemperatureC());
        reading.setHumidityPercent(dto.getHumidityPercent());
        reading.setWeightKg(dto.getWeightKg());
        reading.setGpsLat(dto.getGpsLat());
        reading.setGpsLon(dto.getGpsLon());
        reading.setTamperFlag(dto.getTamperFlag() != null && dto.getTamperFlag());

        sensorReadingRepository.save(reading);

        // 3) Check for alerts
        List<Alert> alerts = evaluateAlerts(batch, reading, dto);
        if (!alerts.isEmpty()) {
            alertRepository.saveAll(alerts);
            log.info("Created {} alerts for batchCode={} boxId={}", alerts.size(), dto.getBatchCode(), dto.getBoxId());
        }
    }

    private List<Alert> evaluateAlerts(Batch batch, SensorReading reading, TelemetryMessageDto dto) {
        List<Alert> alerts = new ArrayList<>();

        // simple hard-coded thresholds for now (move to DB/config later)
        if (reading.getTemperatureC() != null) {
            double temp = reading.getTemperatureC();
            double low = 5.0;
            double high = 25.0;
            if (temp < low || temp > high) {
                alerts.add(buildAlert(batch, reading, "TEMP", temp, low, high,
                        "Temperature out of range: " + temp + " °C"));
            }
        }

        if (reading.getHumidityPercent() != null) {
            double hum = reading.getHumidityPercent();
            double low = 40.0;
            double high = 70.0;
            if (hum < low || hum > high) {
                alerts.add(buildAlert(batch, reading, "HUMIDITY", hum, low, high,
                        "Humidity out of range: " + hum + " %"));
            }
        }

        

        if (reading.getTamperFlag() != null && reading.getTamperFlag()) {
    Alert alert = new Alert();
    alert.setBatch(batch);
    alert.setBoxId(reading.getBoxId());
    alert.setDeviceId(reading.getBoxId());

    String msg = "Tamper detected for box " + reading.getBoxId();
    alert.setMessage(msg);
    alert.setReason(msg); // NEW

    alert.setParameterName("TAMPER");
    alert.setCurrentValue(null);
    alert.setThresholdLow(null);
    alert.setThresholdHigh(null);
    alerts.add(alert);
}




        return alerts;
    }

    private Alert buildAlert(Batch batch,
                         SensorReading reading,
                         String parameterName,
                         Double currentValue,
                         Double low,
                         Double high,
                         String message) {
    Alert alert = new Alert();
    alert.setBatch(batch);
    alert.setBoxId(reading.getBoxId());
    alert.setDeviceId(reading.getBoxId());

    alert.setMessage(message);
    alert.setReason(message); // NEW - keep same as message for now

    alert.setParameterName(parameterName);
    alert.setCurrentValue(currentValue);
    alert.setThresholdLow(low);
    alert.setThresholdHigh(high);
    return alert;
}


}
