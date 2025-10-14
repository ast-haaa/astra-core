package com.astra.service;

import com.astra.model.TelemetrySnapshot;
import com.astra.repository.TelemetrySnapshotRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
// If you're on newer Jackson, prefer JsonReadFeature (see comment below)
// import com.fasterxml.jackson.core.json.JsonReadFeature;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

@Service
public class MqttListenerService {

    private final TelemetrySnapshotRepository repository;
    private final ObjectMapper objectMapper;
    private final RuleEngineService ruleEngineService;

    public MqttListenerService(TelemetrySnapshotRepository repository,
                               RuleEngineService ruleEngineService) {
        this.repository = repository;
        this.ruleEngineService = ruleEngineService;

        // ---- ObjectMapper leniency settings ----
        this.objectMapper = new ObjectMapper();

        // Works on older Jackson:
        this.objectMapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
        this.objectMapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
        try {
            // Some Jackson versions don't have ALLOW_TRAILING_COMMA on JsonParser.Feature.
            // If this line fails to compile, comment it out and use the JsonReadFeature block below.
            this.objectMapper.configure(JsonParser.Feature.ALLOW_TRAILING_COMMA, true);
        } catch (NoSuchFieldError | Exception ignored) {
            // Fallback to JsonReadFeature if available:
            // this.objectMapper.enable(JsonReadFeature.ALLOW_TRAILING_COMMA.mappedFeature());
        }

        System.out.println("MqttListenerService initialized (subscription handled by MqttConfig).");
    }

    /**
     * Called by MqttConfig when a message arrives.
     * Steps: parse → normalize → save → run rules.
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

            // Save snapshot (payload stored as canonical JSON)
            TelemetrySnapshot snapshot = new TelemetrySnapshot();
            snapshot.setId(UUID.randomUUID().toString());
            snapshot.setBoxId(boxId);
            snapshot.setTimestamp(Instant.now());
            snapshot.setPayload(objectMapper.writeValueAsString(node));
            repository.save(snapshot);

            System.out.println("✅ Saved telemetry to DB for box: " + boxId);

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
        // If your broker uses a different layout, tweak the index here.
        return parts.length > 1 ? parts[1] : "unknown";
    }
}
