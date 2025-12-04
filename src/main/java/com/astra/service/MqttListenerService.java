package com.astra.service;

import com.astra.api.dto.TelemetryMessageDto;
import com.astra.model.Alert;
import com.astra.model.DeviceState;
import com.astra.model.TelemetrySnapshot;
import com.astra.repository.DeviceStateRepository;
import com.astra.repository.TelemetrySnapshotRepository;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MqttListenerService {

    private final TelemetrySnapshotRepository repository;
    private final DeviceStateRepository deviceStateRepository;
    private final ObjectMapper objectMapper;
    private final RuleEngineService ruleEngineService;
    private final TelemetryService telemetryService;
    private final GeocodeService geocodeService;
    private final AlertService alertService;

    private final Map<String, Long> lastSensorAlert = new ConcurrentHashMap<>();
    private final Map<String, Long> gpsLastUpdate = new ConcurrentHashMap<>();

    public MqttListenerService(
            TelemetrySnapshotRepository repository,
            DeviceStateRepository deviceStateRepository,
            RuleEngineService ruleEngineService,
            TelemetryService telemetryService,
            GeocodeService geocodeService,
            AlertService alertService
    ) {
        this.repository = repository;
        this.deviceStateRepository = deviceStateRepository;
        this.ruleEngineService = ruleEngineService;
        this.telemetryService = telemetryService;
        this.geocodeService = geocodeService;
        this.alertService = alertService;

        this.objectMapper = new ObjectMapper();
        this.objectMapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
        this.objectMapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
    }

    // =====================================================================
    // MQTT ENTRY POINT
    // =====================================================================
    public void processMessage(String topic, byte[] payloadBytes) {

        String payload = new String(payloadBytes, StandardCharsets.UTF_8);
        System.out.println("📩 MQTT topic=" + topic + " payload=" + payload);

        // --- tele/<deviceId> path ---
        if (topic.startsWith("tele/")) {
            String deviceId = topic.substring(5);
            saveTelemetry(deviceId, payload);

            double temp = extractTemp(payload);
            ruleEngineService.evaluate(deviceId, temp);

            return;
        }

        // --- boxes/<boxId>/telemetry path ---
        try {
            JsonNode node = objectMapper.readTree(payload);

            String boxId = node.has("boxId")
                    ? node.get("boxId").asText()
                    : extractBoxId(topic);

            // Sensor/tamper/weight alerts
            processForBatchSensorAlert(node, boxId);

            // Save snapshot
            TelemetrySnapshot snapshot = new TelemetrySnapshot();
            snapshot.setId(UUID.randomUUID().toString());
            snapshot.setBoxId(boxId);
            snapshot.setTimestamp(Instant.now());
            snapshot.setPayload(node.toString());
            repository.save(snapshot);

            // GPS update
            JsonNode gps = node.path("gps");
            if (!gps.isMissingNode() && !gps.isNull()) {
                String gpsJson = objectMapper.writeValueAsString(gps);
                deviceStateRepository.updateLastLocation(boxId, gpsJson);
                gpsLastUpdate.put(boxId, System.currentTimeMillis());
            }

            // Rule engine on TEMP
            if (node.has("temp")) {
                double temp = node.get("temp").asDouble();
                ruleEngineService.evaluate(boxId, temp);
            }

        } catch (Exception ex) {
            System.err.println("❌ MQTT parse failed: " + ex.getMessage());
        }
    }

    // =====================================================================
    // SAVE TELEMETRY FOR tele/<id>
    // =====================================================================
    private void saveTelemetry(String deviceId, String json) {
        try {
            JsonNode obj = objectMapper.readTree(json);

            DeviceState st = deviceStateRepository.findById(deviceId)
                    .orElseGet(() -> {
                        DeviceState d = new DeviceState();
                        d.setDeviceId(deviceId);
                        return d;
                    });

            if (obj.has("peltier")) st.setPeltier(obj.get("peltier").asText());
            if (obj.has("fan")) st.setFan(obj.get("fan").asText());
            if (obj.has("temp")) st.setTargetTemp(obj.get("temp").asDouble());
            if (obj.has("gps")) st.setLastLocation(obj.get("gps").toString());

            st.setUpdatedAt(LocalDateTime.now());
            deviceStateRepository.save(st);

        } catch (Exception e) {
            System.out.println("❌ saveTelemetry FAILED: " + e.getMessage());
        }
    }

    private double extractTemp(String json) {
        try {
            JsonNode obj = objectMapper.readTree(json);
            return obj.has("temp") ? obj.get("temp").asDouble() : -999;
        } catch (Exception e) {
            return -999;
        }
    }

    private String extractBoxId(String topic) {
        String[] p = topic.split("/");
        return p.length > 1 ? p[1] : "unknown";
    }

    // =====================================================================
    // SENSOR MISSING + WEIGHT LOW + TAMPER ALERTS
    // =====================================================================
    private void processForBatchSensorAlert(JsonNode node, String boxId) {

        Double temp = node.has("temp") ? node.get("temp").asDouble() : null;
        Double hum = node.has("humidity") ? node.get("humidity").asDouble() : null;
        Double weight = node.has("weight") ? node.get("weight").asDouble() : null;
        Boolean tamper = node.has("tamper") ? node.get("tamper").asBoolean() : null;

        long now = System.currentTimeMillis();

        // TEMP MISSING
        if (temp == null) {
            long last = lastSensorAlert.getOrDefault(boxId + "_TEMP", 0L);
            if (now - last > 60000) {
                alertService.createFromTemplate(
                        "SENSOR_TEMP_MISSING",
                        Map.of("boxId", boxId),
                        null, boxId, boxId, Alert.Status.OPEN
                );
                lastSensorAlert.put(boxId + "_TEMP", now);
            }
        }

        // HUMIDITY MISSING
        if (hum == null) {
            long last = lastSensorAlert.getOrDefault(boxId + "_HUM", 0L);
            if (now - last > 60000) {
                alertService.createFromTemplate(
                        "SENSOR_HUMID_MISSING",
                        Map.of("boxId", boxId),
                        null, boxId, boxId, Alert.Status.OPEN
                );
                lastSensorAlert.put(boxId + "_HUM", now);
            }
        }

        // WEIGHT LOW (<2 kg)
        if (weight != null && weight < 2.0) {
            alertService.createFromTemplate(
                    "WEIGHT_LOW",
                    Map.of("boxId", boxId, "value", String.format("%.1f", weight)),
                    null, boxId, boxId, Alert.Status.OPEN
            );
        }

        // TAMPER DETECTED
        if (tamper != null && tamper) {
            alertService.createFromTemplate(
                    "TAMPER_DETECTED",
                    Map.of("boxId", boxId),
                    null, boxId, boxId, Alert.Status.OPEN
            );
        }
    }
}
