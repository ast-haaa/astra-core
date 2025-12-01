package com.astra.controller;

import com.astra.api.dto.BatchDto;
import com.astra.api.dto.JourneyEventDto;
import com.astra.model.*;
import com.astra.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class ConsumerJourneyController {

    private final BatchRepository batchRepo;
    private final AlertRepository alertRepo;
    private final AlertActionRepository actionRepo;
    private final LabTestRepository labRepo;
    private final EventRepository eventRepo; // optional — include if present

    @GetMapping("/batch-journey")
    public ResponseEntity<?> getJourney(@RequestParam String batchCode) {

        Batch batch = batchRepo.findByBatchCode(batchCode)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));

        List<JourneyEventDto> timeline = new ArrayList<>();

        // ALERTS
        try {
            alertRepo.findByBatchCode(batchCode).forEach(a ->
                timeline.add(JourneyEventDto.fromAlert(a))
            );
        } catch (Throwable ignored) {}

        // ALERT ACTIONS
        try {
            actionRepo.findByBatchCode(batchCode).forEach(ac ->
                timeline.add(JourneyEventDto.fromAction(ac))
            );
        } catch (Throwable ignored) {}

        // LAB TESTS
        try {
            labRepo.findByBatchCode(batchCode).forEach(l ->
                timeline.add(JourneyEventDto.fromLab(l))
            );
        } catch (Throwable ignored) {}

        // DEVICE EVENTS / TELEMETRY (if you want to include)
        try {
            eventRepo.findByBatchCode(batchCode).forEach(ev -> {
                // create a sensible detail/meta for events
                String ts = safeIso(ev.getTs() != null ? ev.getTs().toString() : null);
                String detail = ev.getType() + " : " + (ev.getPayloadJson() == null ? "" : ev.getPayloadJson());
                timeline.add(new JourneyEventDto(ts, "EVENT", detail, ev.getType()));
            });
        } catch (Throwable ignored) {}

        // Sort newest-first by timestampIso (best-effort)
        timeline.sort((a, b) -> {
            Instant ia = parseIsoSafe(a.getTimestampIso());
            Instant ib = parseIsoSafe(b.getTimestampIso());
            return ib.compareTo(ia); // newest first
        });

        Map<String,Object> out = Map.of(
            "batch", BatchDto.from(batch),
            "timeline", timeline
        );

        return ResponseEntity.ok(out);
    }

    // ---- helpers ----
    private static Instant parseIsoSafe(String s) {
        if (s == null || s.isBlank()) return Instant.EPOCH;
        try {
            return Instant.parse(s);
        } catch (DateTimeParseException ex) {
            // try to parse local-ish formats, fallback to epoch
            try {
                return Instant.parse(s.replace(" ", "T"));
            } catch (Exception e) {
                return Instant.EPOCH;
            }
        }
    }

    private static String safeIso(String s) {
        if (s == null) return "";
        // if it's already ISO-ish, return; else try parse to Instant then toString
        try {
            Instant.parse(s);
            return s;
        } catch (Exception e) {
            try {
                return parseIsoSafe(s).toString();
            } catch (Exception ex) {
                return "";
            }
        }
    }
}
