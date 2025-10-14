package com.astra.service;

import com.astra.api.dto.DeviceStateDto;
import com.astra.model.Event;
import com.astra.repository.EventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.Collections;


import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public DeviceStateDto getCurrentState(String deviceId) {
    // 1) latest TELEMETRY
    var latestTelemetry = eventRepository.findTopByBoxIdAndTypeOrderByTsDesc(deviceId, "TELEMETRY");

    Double temp = null;
    Double rh = null;
    Double voc = null;
    Instant tsTelemetry = null;

    if (latestTelemetry.isPresent()) {
        Event e = latestTelemetry.get();
        tsTelemetry = e.getTs().atZone(ZoneOffset.UTC).toInstant();
        // parse JSON payload
        Map<String, Object> payload = parseJson(e.getPayloadJson());
        temp = getDouble(payload, "temp");
        rh = getDouble(payload, "rh");
        voc = getDouble(payload, "voc");
    }

    // 2) latest peltier event
    var latestPeltier = eventRepository.findTopByBoxIdAndTypeInOrderByTsDesc(
            deviceId,
            List.of("peltier_on", "peltier_off")
    );

    String peltier = "UNKNOWN";
    if (latestPeltier.isPresent()) {
        String type = latestPeltier.get().getType();
        if ("peltier_on".equalsIgnoreCase(type)) peltier = "ON";
        if ("peltier_off".equalsIgnoreCase(type)) peltier = "OFF";
    }

    // 3) which timestamp to show?
    Instant finalTs = tsTelemetry; // or peltier ts if you prefer

    return new DeviceStateDto(deviceId, temp, rh, voc, peltier, finalTs);
}

// --- helper to parse JSON payload into Map ---
private Map<String, Object> parseJson(String json) {
    try {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        // Option A: TypeReference (preferred)
        return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
    } catch (Exception ignore) {
        try {
            // Option B: TypeFactory (fallback if TypeReference overload is weird)
            return objectMapper.readValue(
                json,
                objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class)
            );
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }
}

// --- helper to extract numbers ---
private Double getDouble(Map<String, Object> map, String key) {
    Object v = map.get(key);
    if (v instanceof Number n) return n.doubleValue();
    try { return v == null ? null : Double.parseDouble(v.toString()); }
    catch (Exception e) { return null; }
}

    /**
     * Save an event row into DB.
     */
    public void emit(String boxId, String type, Map<String, Object> payload, String actor) {
        try {
            String json = payload == null ? null : objectMapper.writeValueAsString(payload);

            Event e = new Event();
            e.setId(UUID.randomUUID().toString());
            e.setBoxId(boxId);
            e.setType(type);
            e.setPayloadJson(json);
            e.setActor(actor == null ? "auto" : actor);
            e.setTs(LocalDateTime.now(ZoneOffset.UTC)); // ensure UTC

            eventRepository.save(e);
            System.out.println("✅ Event saved: " + type + " for " + boxId);
        } catch (Exception ex) {
            System.err.println("❌ Event save failed: " + ex.getMessage());
        }
    }

    /**
     * NEW: fetch events with filters and keyset pagination.
     */
    public List<Event> fetchDeviceEvents(
            String deviceId,
            String type,
            Instant since,
            Instant until,
            Instant afterTs,
            UUID afterId,
            int limit
    ) {
        LocalDateTime sinceLdt   = toUtcLdt(since);
        LocalDateTime untilLdt   = toUtcLdt(until);
        LocalDateTime afterTsLdt = toUtcLdt(afterTs);
        String afterIdStr        = (afterId == null) ? null : afterId.toString();

        Pageable pageable = PageRequest.of(0, Math.max(1, Math.min(limit, 200)));

        return eventRepository.findDeviceEvents(
                deviceId,
                type,
                sinceLdt,
                untilLdt,
                afterTsLdt,
                afterIdStr,
                pageable
        );
    }

    private static LocalDateTime toUtcLdt(Instant instant) {
        if (instant == null) return null;
        return LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }
}
