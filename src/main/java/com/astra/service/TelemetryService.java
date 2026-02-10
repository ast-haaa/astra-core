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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


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

    public Telemetry save(Telemetry t) {
        return telemetryRepository.save(t);
    }

    public Optional<Telemetry> findLatestByBoxId(String boxId) {
    return telemetryRepository.findTopByBoxIdOrderByTimestampDesc(boxId);
}

    // 🔕 Flood control
    private boolean recentlyAlerted(String boxId, int minutes) {
        LocalDateTime since = LocalDateTime.now().minusMinutes(minutes);
        return alertRepository.existsByBoxIdAndCreatedAtAfter(boxId, since);
    }

    @Transactional
    public void handleTelemetry(TelemetryMessageDto dto) {

        if (!"BOX_TULSI_001".equals(dto.getBoxId())) {
            return;
        }

        Batch tulsiBatch = batchRepository.findById(3L)
                .orElseThrow(() -> new RuntimeException("Tulsi batch not found"));

        SensorReading reading = new SensorReading();
        reading.setBatch(tulsiBatch);
        reading.setBoxId(dto.getBoxId());
        reading.setTimestamp(LocalDateTime.now());

        reading.setTemperatureC(dto.getTemperatureC());
        reading.setHumidityPercent(dto.getHumidityPercent());
        reading.setGpsLat(dto.getGpsLat());
        reading.setGpsLon(dto.getGpsLon());

        sensorReadingRepository.save(reading);

        // ✅ Rate limit alerts (5 min)
        if (recentlyAlerted(dto.getBoxId(), 5)) return;

        List<Alert> alerts = evaluateAlerts(tulsiBatch, reading);
        if (!alerts.isEmpty()) {
            alertRepository.saveAll(alerts);
            log.info("Created {} alerts for Tulsi boxId={}",
                    alerts.size(), dto.getBoxId());
        }
    }

    private List<Alert> evaluateAlerts(Batch batch, SensorReading reading) {

        List<Alert> alerts = new ArrayList<>();

        if (reading.getTemperatureC() != null) {
            double temp = reading.getTemperatureC();
            if (temp < 5 || temp > 25) {
                alerts.add(buildAlert(batch, reading, "TEMP", temp, 5.0, 25.0,
                        "Temperature out of range on box {boxId} for {minutes} minutes"));
            }
        }

        if (reading.getHumidityPercent() != null) {
            double hum = reading.getHumidityPercent();
            if (hum < 40 || hum > 70) {
                alerts.add(buildAlert(batch, reading, "HUMIDITY", hum, 40.0, 70.0,
                        "Humidity out of range on box {boxId} for {minutes} minutes"));
            }
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
        alert.setReason(message);
        alert.setParameterName(parameterName);
        alert.setCurrentValue(currentValue);
        alert.setThresholdLow(low);
        alert.setThresholdHigh(high);

        return alert;
    }
}
