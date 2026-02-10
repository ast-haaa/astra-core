package com.astra.service;

import com.astra.api.dto.DeviceStateDto;
import com.astra.model.Event;
import com.astra.model.TelemetrySnapshot;
import com.astra.repository.EventRepository;
import com.astra.repository.TelemetrySnapshotRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.Optional;

@Service
public class DeviceStateService {

    private final TelemetrySnapshotRepository snapshotRepo;
    private final EventRepository eventRepo;
    private final ObjectMapper objectMapper;

    public DeviceStateService(TelemetrySnapshotRepository snapshotRepo,
                              EventRepository eventRepo,
                              ObjectMapper objectMapper) {
        this.snapshotRepo = snapshotRepo;
        this.eventRepo = eventRepo;
        this.objectMapper = objectMapper;
    }

    /**
     * Build a DTO with latest telemetry + last known peltier state.
     * Throws IllegalStateException if no telemetry exists for this device yet.
     */
    public DeviceStateDto getLatestState(String boxId) {
        TelemetrySnapshot snap = snapshotRepo
                .findTopByBoxIdOrderByTimestampDesc(boxId)
                .orElseThrow(() -> new IllegalStateException("No telemetry yet for device: " + boxId));

        // Extract temp/rh/voc from JSON payload
        Double temp = null, rh = null, voc = null;
        try {
            // Assuming entity has a String 'payload' column holding JSON.
            // Adapt to snap.getPayloadJson() if your getter is named differently.
            String payloadStr = getPayloadAsString(snap);
            JsonNode node = objectMapper.readTree(payloadStr == null ? "{}" : payloadStr);
            temp = node.hasNonNull("temp") ? node.get("temp").asDouble() : null;
            rh   = node.hasNonNull("rh")   ? node.get("rh").asDouble()   : null;
            voc  = node.hasNonNull("voc")  ? node.get("voc").asDouble()  : null;
        } catch (Exception e) {
            // Leave temp/rh/voc as null if parsing fails; DTO still returns timestamp + peltier
        }

        // Last known peltier state from latest peltier_on/off event
        String peltier = eventRepo.findLatestPeltierEvent(boxId)
                .map(Event::getType)
                .map(t -> "peltier_on".equalsIgnoreCase(t) ? "ON" :
                          "peltier_off".equalsIgnoreCase(t) ? "OFF" : "UNKNOWN")
                .orElse("UNKNOWN");

        // Convert snapshot timestamp to Instant (supports Instant or LocalDateTime)
        Instant tsUtc = toInstantUtc(snap.getTimestamp());

        return new DeviceStateDto(
                boxId,
                temp, rh, voc,
                peltier,
                tsUtc
        );
    }

    private String getPayloadAsString(TelemetrySnapshot snap) {
        // Adjust this method to match your entity’s field name/type.
        // Common cases:
        //   - String getPayload()
        //   - byte[] getPayload()
        //   - JsonNode getPayload()
        try {
            // Try reflection-friendly approach to avoid renaming here:
            try {
                var m = snap.getClass().getMethod("getPayload");
                Object val = m.invoke(snap);
                if (val == null) return null;
                if (val instanceof String s) return s;
                if (val instanceof byte[] b) return new String(b);
                if (val instanceof JsonNode n) return n.toString();
            } catch (NoSuchMethodException ignore) {
                // fallback to common alternative names
                try {
                    var m2 = snap.getClass().getMethod("getPayloadJson");
                    Object val = m2.invoke(snap);
                    if (val == null) return null;
                    if (val instanceof String s) return s;
                    if (val instanceof JsonNode n) return n.toString();
                } catch (NoSuchMethodException ignore2) { /* no-op */ }
            }
        } catch (Exception ignore) { /* parse later as empty */ }
        return null;
    }

    private Instant toInstantUtc(Object ts) {
        if (ts == null) return null;
        if (ts instanceof Instant i) return i;
        if (ts instanceof LocalDateTime ldt) {
            return ldt.atZone(ZoneId.systemDefault()).toInstant();
        }
        if (ts instanceof OffsetDateTime odt) {
            return odt.toInstant();
        }
        if (ts instanceof ZonedDateTime zdt) {
            return zdt.toInstant();
        }
        // Unknown type → now as fallback (or return null)
        return Instant.now();
    }
}
