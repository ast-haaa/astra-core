package com.astra.controller;

import com.astra.model.Event;
import com.astra.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

/**
 * SyncController: ensures boxId is non-null (derive from batchCode or fallback).
 */
@RestController
@RequiredArgsConstructor
public class SyncController {

    private final EventRepository eventRepository;

    public static class ClientEventDTO {
        public String clientEventId;
        public String boxId;       // NEW: prefer client to send this
        public String type;
        public String batchCode;
        public Map<String,Object> payload;
        public Long createdAt;  // epoch millis (optional)
    }

    @PostMapping("/api/sync/events")
    public ResponseEntity<?> syncEvents(@RequestBody List<ClientEventDTO> events) {
        List<Map<String,Object>> out = new ArrayList<>();

        for (ClientEventDTO ce : events) {
            Map<String,Object> r = new HashMap<>();
            String clientId = (ce.clientEventId == null || ce.clientEventId.isBlank()) ? UUID.randomUUID().toString() : ce.clientEventId;
            r.put("clientEventId", clientId);

            try {
                boolean exists = false;
                try {
                    exists = eventRepository.existsByClientEventId(clientId);
                } catch (Throwable t) {
                    exists = eventRepository.findAll().stream().anyMatch(e -> clientId.equals(e.getClientEventId()));
                }

                if (exists) {
                    r.put("status", "skipped");
                    out.add(r);
                    continue;
                }

                Event e = new Event();
                e.setId(UUID.randomUUID().toString());

                // Determine boxId (must be non-null)
                String boxId = null;
                if (ce.boxId != null && !ce.boxId.isBlank()) {
                    boxId = ce.boxId;
                } else if (ce.batchCode != null && !ce.batchCode.isBlank()) {
                    // if batchCode like "BATCH-BOX123" -> derive BOX123
                    boxId = ce.batchCode.replaceFirst("(?i)^BATCH[-_]?","").trim();
                    if (boxId.isBlank()) boxId = null;
                }
                if (boxId == null) {
                    boxId = "unknown-" + UUID.randomUUID().toString();
                }
                e.setBoxId(boxId);

                e.setBatchCode(ce.batchCode);
                e.setClientEventId(clientId);
                e.setType(ce.type == null ? "UNKNOWN" : ce.type);
                // serialize payload to valid JSON for JSON column (MySQL strict)
String payloadJson = null;
if (ce.payload != null) {
    try {
        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
        payloadJson = om.writeValueAsString(ce.payload);
    } catch (Exception ex) {
        // fallback to simple string but warn
        payloadJson = ce.payload.toString();
        System.err.println("WARN: payload failed JSON serialize, saving to string: " + ex.getMessage());
    }
}
e.setPayloadJson(payloadJson);


                LocalDateTime ts = (ce.createdAt != null)
                        ? LocalDateTime.ofInstant(Instant.ofEpochMilli(ce.createdAt), ZoneId.systemDefault())
                        : LocalDateTime.now();
                e.setTs(ts);

                Event saved = eventRepository.save(e);
                r.put("status", "created");
                r.put("id", saved.getId());
            } catch (Exception ex) {
                r.put("status", "error");
                r.put("error", ex.getMessage());
            }
            out.add(r);
        }

        return ResponseEntity.ok(out);
    }
}
