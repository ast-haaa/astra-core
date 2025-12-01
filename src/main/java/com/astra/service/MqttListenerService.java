package com.astra.service;

import com.astra.api.dto.TelemetryMessageDto;
import com.astra.model.TelemetrySnapshot;
import com.astra.repository.DeviceStateRepository;
import com.astra.repository.TelemetrySnapshotRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

@Service
public class MqttListenerService {

    private final TelemetrySnapshotRepository repository;
    private final DeviceStateRepository deviceStateRepository;
    private final ObjectMapper objectMapper;
    private final RuleEngineService ruleEngineService;
    private final TelemetryService telemetryService;
    private final GeocodeService geocodeService;

    public MqttListenerService(TelemetrySnapshotRepository repository,
                               DeviceStateRepository deviceStateRepository,
                               RuleEngineService ruleEngineService,
                               TelemetryService telemetryService,
                               GeocodeService geocodeService) {
        this.repository = repository;
        this.deviceStateRepository = deviceStateRepository;
        this.ruleEngineService = ruleEngineService;
        this.telemetryService = telemetryService;
        this.geocodeService = geocodeService;

        // ---- ObjectMapper leniency settings ----
        this.objectMapper = new ObjectMapper();
        this.objectMapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
        this.objectMapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
        try {
            this.objectMapper.configure(JsonParser.Feature.ALLOW_TRAILING_COMMA, true);
        } catch (NoSuchFieldError | Exception ignored) {
            // fallback ignored
        }

        System.out.println("MqttListenerService initialized (subscription handled by MqttConfig).");
    }

    /**
     * Called by MqttConfig when a message arrives.
     * Steps: parse → normalize → save → run rules → update GPS → batch/sensor/alert.
     */
    public void processMessage(String topic, byte[] payloadBytes) {
        String payload = new String(payloadBytes, StandardCharsets.UTF_8);
        System.out.println("📩 Received message on topic: " + topic);
        System.out.println("Raw payload string: " + payload);
        System.out.println("Raw payload bytes: " + Arrays.toString(payloadBytes));

        try {
            // Normalize incoming payload to valid JSON string
            String json = com.astra.util.PayloadSanitizer.ensureValidJson(payload);
            System.out.println("Normalized JSON: " + json);

            JsonNode node = objectMapper.readTree(json);

            // Prefer boxId from JSON; fallback to topic segment (e.g., boxes/<id>/telemetry)
            String boxId = node.hasNonNull("boxId")
                    ? node.get("boxId").asText()
                    : extractBoxId(topic);

            // === New Batch/Sensor/Alert Pipeline ===
            try {
                processForBatchSensorAlert(node, boxId);
            } catch (Exception e) {
                System.err.println("⚠ Failed Batch/Sensor/Alert pipeline: " + e.getMessage());
            }

            // Save snapshot (payload stored as canonical JSON)
            TelemetrySnapshot snapshot = new TelemetrySnapshot();
            snapshot.setId(UUID.randomUUID().toString());
            snapshot.setBoxId(boxId);

            // prefer timestamp from payload if present
            if (node.hasNonNull("timestamp")) {
                try {
                    snapshot.setTimestamp(Instant.parse(node.get("timestamp").asText()));
                } catch (Exception e) {
                    snapshot.setTimestamp(Instant.now());
                }
            } else {
                snapshot.setTimestamp(Instant.now());
            }

            snapshot.setPayload(objectMapper.writeValueAsString(node));
            repository.save(snapshot);

            System.out.println("✅ Saved telemetry to DB for box: " + boxId);

            // ---- GPS handling: update device_state.last_location if gps object present ----
            JsonNode gpsNode = node.path("gps");
            if (!gpsNode.isMissingNode() && !gpsNode.isNull()) {
                try {
                    String gpsJson = objectMapper.writeValueAsString(gpsNode);
                    deviceStateRepository.updateLastLocation(boxId, gpsJson);
                    System.out.println("📍 Updated last_location for " + boxId + " → " + gpsJson);
                } catch (Exception e) {
                    System.err.println("⚠ Failed to update last_location for " + boxId + ": " + e.getMessage());
                }
            }

            // ---- Run rules (only if temperature exists) ----
            if (node.hasNonNull("temp")) {
                double temp = safeDouble(node.get("temp"));
                try {
                    ruleEngineService.evaluate(boxId, temp);
                } catch (Exception re) {
                    System.err.println("⚠ RuleEngine error for " + boxId + ": " + re.getMessage());
                }
            } else {
                System.out.println("ℹ No 'temp' in payload; skipping rules for " + boxId);
            }

        } catch (JsonProcessingException jpe) {
            System.err.println("❌ Failed to parse/normalize payload — payload was: " + payload);
            jpe.printStackTrace();
        } catch (Exception e) {
            System.err.println("❌ Failed to save telemetry — DB or unexpected error:");
            e.printStackTrace();
        }
    }

    private double safeDouble(JsonNode n) {
        try {
            return n.asDouble();
        } catch (Exception e) {
            return Double.NaN;
        }
    }

    private String extractBoxId(String topic) {
        // Expecting something like "boxes/<id>/telemetry"
        if (topic == null || topic.isEmpty()) return "unknown";
        String[] parts = topic.split("/");
        return parts.length > 1 ? parts[1] : "unknown";
    }

    // New helper for Batch/Sensor/Alert
    private void processForBatchSensorAlert(JsonNode node, String boxId) {
        String batchCode = node.hasNonNull("batchCode")
                ? node.get("batchCode").asText()
                : "BATCH-" + boxId;

        Double temperature = node.hasNonNull("temp") ? node.get("temp").asDouble() : null;
        Double humidity = node.hasNonNull("humidity") ? node.get("humidity").asDouble() : null;
        Double voc = node.hasNonNull("voc") ? node.get("voc").asDouble() : null;
        Double weight = node.hasNonNull("weight") ? node.get("weight").asDouble() : null;

        Double gpsLat = node.path("gps").path("lat").isNumber()
                ? node.path("gps").path("lat").asDouble()
                : null;
        Double gpsLon = node.path("gps").path("lon").isNumber()
                ? node.path("gps").path("lon").asDouble()
                : null;

        Boolean tamperFlag = node.hasNonNull("tamper") && node.get("tamper").asBoolean();

        Long ts = node.hasNonNull("timestamp")
                ? Instant.parse(node.get("timestamp").asText()).toEpochMilli()
                : Instant.now().toEpochMilli();

        TelemetryMessageDto dto = new TelemetryMessageDto();
        dto.setBoxId(boxId);
        dto.setBatchCode(batchCode);
        dto.setTemperatureC(temperature);
        dto.setHumidityPercent(humidity);
        dto.setVocPpm(voc);
        dto.setWeightKg(weight);
        dto.setGpsLat(gpsLat);
        dto.setGpsLon(gpsLon);
        dto.setTamperFlag(tamperFlag);
        dto.setTimestampEpochMillis(ts);

        // === GEOCODE: best-effort attach human-readable address if GPS present ===
        if (dto.getGpsLat() != null && dto.getGpsLon() != null) {
            try {
                double lat = dto.getGpsLat();
                double lon = dto.getGpsLon();
                String addr = geocodeService.reverse(lat, lon);
                if (addr != null && !addr.isBlank()) {
                    try {
                        // prefer direct setter
                        dto.setLocationText(addr);
                    } catch (NoSuchMethodError | AbstractMethodError | Exception ignore) {
                        // if setter doesn't exist, attempt reflective setter (safe)
                        try {
                            dto.getClass().getMethod("setLocationText", String.class).invoke(dto, addr);
                        } catch (NoSuchMethodException nm) {
                            // no setter available — ignore, telemetry still processed
                        }
                    }
                }
            } catch (Throwable ge) {
                System.err.println("⚠ Geocode failed: " + ge.getMessage());
            }
        }

        // HAND OFF to telemetryService (same as before)
        telemetryService.handleTelemetry(dto);
    }
}
