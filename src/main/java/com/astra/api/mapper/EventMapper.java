package com.astra.api.mapper;

import com.astra.api.dto.EventResponseDTO;
import com.astra.model.Event;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.Map;

public final class EventMapper {
    private static final ObjectMapper M = new ObjectMapper();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private EventMapper() {}

    public static EventResponseDTO toDTO(Event e) {
        return new EventResponseDTO(
                e.getId(),
                e.getType() == null ? null : e.getType().toLowerCase(),
                toInstant(e.getTs()),
                parsePayload(e.getPayloadJson()),
                (e.getActor() == null || e.getActor().isBlank() ? "auto" : e.getActor()),
  // map actor -> source for now
                null            // no severity field in entity
        );
    }

    private static Instant toInstant(java.time.LocalDateTime ldt) {
        if (ldt == null) return null;
        // DB timestamps are UTC for your use-case; adjust if you store timezone elsewhere
        return ldt.toInstant(ZoneOffset.UTC);
    }

    private static Map<String, Object> parsePayload(String json) {
        try {
            if (json == null || json.isBlank()) return Collections.emptyMap();
            return M.readValue(json, MAP_TYPE);
        } catch (Exception ex) {
            // don’t blow up the response on bad JSON — return raw
            return Map.of("raw", json);
        }
    }
}
