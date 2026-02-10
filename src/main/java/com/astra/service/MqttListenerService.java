package com.astra.service;

import com.astra.api.dto.TelemetryMessageDto;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class MqttListenerService {

    private final TelemetryService telemetryService;
    private final ObjectMapper objectMapper;

    public MqttListenerService(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;

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

        try {
            JsonNode node = objectMapper.readTree(payload);

            String boxId = node.has("boxId")
                    ? node.get("boxId").asText()
                    : extractBoxId(topic);

            TelemetryMessageDto dto = new TelemetryMessageDto();
            dto.setBoxId(boxId);

            if (node.has("batchCode")) dto.setBatchCode(node.get("batchCode").asText());
            if (node.has("temp")) dto.setTemperatureC(node.get("temp").asDouble());
            if (node.has("humidity")) dto.setHumidityPercent(node.get("humidity").asDouble());
            if (node.has("weight")) dto.setWeightKg(node.get("weight").asDouble());
            if (node.has("gpsLat")) dto.setGpsLat(node.get("gpsLat").asDouble());
            if (node.has("gpsLon")) dto.setGpsLon(node.get("gpsLon").asDouble());
            if (node.has("tamper")) dto.setTamperFlag(node.get("tamper").asBoolean());

            dto.setTimestampEpochMillis(System.currentTimeMillis());

            telemetryService.handleTelemetry(dto);

        } catch (Exception ex) {
            System.err.println("❌ MQTT parse failed: " + ex.getMessage());
        }
    }

    private String extractBoxId(String topic) {
        String[] p = topic.split("/");
        return p.length > 1 ? p[1] : "unknown";
    }
}
