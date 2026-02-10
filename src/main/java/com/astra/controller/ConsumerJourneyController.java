package com.astra.controller;

import com.astra.api.dto.BatchDto;
import com.astra.api.dto.JourneyEventDto;
import com.astra.model.*;
import com.astra.repository.*;
import com.astra.service.BoxReadingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;

@RestController
@RequestMapping("/api/consumer")
@RequiredArgsConstructor
public class ConsumerJourneyController {

    private final BatchRepository batchRepo;
    private final AlertRepository alertRepo;
    private final AlertActionRepository actionRepo;
    private final LabTestRepository labRepo;
    private final EventRepository eventRepo;
    private final BoxReadingsService boxReadingsService;

    // ✅ Consumer Journey API (Accepts batchCode OR boxId)
    @GetMapping("/journey/{id}")
    public ResponseEntity<?> getJourney(@PathVariable String id) {

        // ✅ SAFE LOOKUP — BOX FIRST, THEN BATCH CODE
        Batch batch = null;

List<Batch> list = batchRepo.findAllByBoxIdOrderByCreatedAtDesc(id);

if (list != null && !list.isEmpty()) {
    batch = list.get(0); // latest batch
}

if (batch == null) {
    batch = batchRepo.findByBatchCode(id).orElse(null);
}

if (batch == null) {
    throw new ResponseStatusException(
        HttpStatus.NOT_FOUND,
        "Batch not found for this box or batch code"
    );
}

        if (batch == null) {
            batch = batchRepo.findByBatchCode(id).orElse(null);
        }

        if (batch == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Batch not found for this box or batch code"
            );
        }

        String batchCode = batch.getBatchCode();

        List<JourneyEventDto> timeline = new ArrayList<>();

        // ALERTS
        try {
            alertRepo.findByBatch_BatchCode(batchCode)
                    .forEach(a -> timeline.add(JourneyEventDto.fromAlert(a)));
        } catch (Throwable ignored) {}

        // ALERT ACTIONS
        try {
            actionRepo.findByBatchCode(batchCode)
                    .forEach(ac -> timeline.add(JourneyEventDto.fromAction(ac)));
        } catch (Throwable ignored) {}

        // LAB TESTS
        try {
            labRepo.findByBatchCode(batchCode)
                    .forEach(l -> timeline.add(JourneyEventDto.fromLab(l)));
        } catch (Throwable ignored) {}

        // DEVICE EVENTS
        try {
            eventRepo.findByBatchCode(batchCode).forEach(ev -> {

                if (ev.getTs() == null) {
                    ev.setTs(LocalDateTime.now());
                }

                String ts = safeIso(ev.getTs().toString());
                String detail = ev.getType() + " : " +
                        (ev.getPayloadJson() == null ? "" : ev.getPayloadJson());

                timeline.add(new JourneyEventDto(ts, "EVENT", detail, ev.getType()));
            });
        } catch (Throwable ignored) {}

        // SORT TIMELINE
        timeline.sort((a, b) -> {
            Instant ia = parseIsoSafe(a.getTimestampIso());
            Instant ib = parseIsoSafe(b.getTimestampIso());
            return ib.compareTo(ia);
        });

        // LIMIT SIZE
        if (timeline.size() > 100) {
            timeline.subList(100, timeline.size()).clear();
        }

        // ---------------- SCORE ----------------
        int alertsCount = 0;
        int actionsCount = 0;
        int labCount = 0;
        int deviceMoves = 0;
        boolean labFailed = false;

        for (JourneyEventDto ev : timeline) {
            String t = ev.getType();
            if (t == null) continue;
            t = t.toUpperCase();

            if (t.equals("ALERT")) alertsCount++;
            else if (t.equals("ACTION") || t.equals("ALERT_ACTION")) actionsCount++;
            else if (t.equals("LAB") || t.equals("LAB_TEST")) {
                labCount++;
                if (ev.getMeta() != null &&
                        ev.getMeta().toLowerCase().contains("fail")) {
                    labFailed = true;
                }
            }
            else if (t.equals("EVENT")) deviceMoves++;
        }

        int timelineScore = 100;
        timelineScore -= alertsCount * 12;
        timelineScore -= labCount * 4;
        timelineScore -= actionsCount;
        timelineScore -= Math.min(deviceMoves, 10);

        if (timelineScore < 0) timelineScore = 0;
        if (labFailed) timelineScore = Math.min(timelineScore, 40);

        int coldChainScore = boxReadingsService.calculateColdChainScore(batch.getBoxId());
        int labScore = labFailed ? 20 : 95;

        int finalScore = (int) Math.round(
                0.6 * coldChainScore +
                0.3 * timelineScore +
                0.1 * labScore
        );

        finalScore = Math.max(0, Math.min(100, finalScore));

        // ---------------- QUALITY ----------------
        String qualityStatus;
        String qualityMessage;

        if (finalScore >= 85) {
            qualityStatus = "SAFE";
            qualityMessage = batch.getHerbName() + " quality is excellent.";
        } else if (finalScore >= 60) {
            qualityStatus = "MODERATE";
            qualityMessage = batch.getHerbName() + " quality acceptable.";
        } else {
            qualityStatus = "RISKY";
            qualityMessage = "Storage or handling risk detected.";
        }

        boolean recalled = batch.getStatus() == BatchStatus.RECALLED;

        if (recalled) {
            qualityStatus = "RISKY";
            qualityMessage = "This batch has been recalled. Do not consume.";
        }

        Map<String, Object> out = new HashMap<>();
        out.put("batch", BatchDto.from(batch));
        out.put("timeline", timeline);
        out.put("qualityScore", finalScore);
        out.put("qualityStatus", qualityStatus);
        out.put("qualityMessage", qualityMessage);
        out.put("shipmentStatus", batch.getShipmentStatus());

        return ResponseEntity.ok(out);
    }

    private static Instant parseIsoSafe(String s) {
        if (s == null || s.isBlank()) return Instant.EPOCH;
        try {
            return Instant.parse(s);
        } catch (Exception e) {
            return Instant.EPOCH;
        }
    }

    private static String safeIso(String s) {
        if (s == null) return "";
        try {
            Instant.parse(s);
            return s;
        } catch (Exception e) {
            return parseIsoSafe(s).toString();
        }
    }
}
