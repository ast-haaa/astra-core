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
import java.time.format.DateTimeParseException;
import java.util.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class ConsumerJourneyController {

    private final BatchRepository batchRepo;
    private final AlertRepository alertRepo;
    private final AlertActionRepository actionRepo;
    private final LabTestRepository labRepo;
    private final EventRepository eventRepo;

    // Cold-chain scoring service
    private final BoxReadingsService boxReadingsService;

    @GetMapping("/batch-journey")
    public ResponseEntity<?> getJourney(@RequestParam String batchCode) {

        Batch batch = batchRepo.findByBatchCode(batchCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));

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
                String ts = safeIso(ev.getTs() != null ? ev.getTs().toString() : null);
                String detail = ev.getType() + " : " + (ev.getPayloadJson() == null ? "" : ev.getPayloadJson());
                timeline.add(new JourneyEventDto(ts, "EVENT", detail, ev.getType()));
            });
        } catch (Throwable ignored) {}

        // Sort newest first
        timeline.sort((a, b) -> {
            Instant ia = parseIsoSafe(a.getTimestampIso());
            Instant ib = parseIsoSafe(b.getTimestampIso());
            return ib.compareTo(ia);
        });

        // ---------------------------------------------------------------------
        // 1) TIMELINE SCORE (EVENT-BASED)
        // ---------------------------------------------------------------------
        int totalEvents   = timeline.size();
        int alertsCount   = 0;
        int actionsCount  = 0;
        int labCount      = 0;
        int deviceMoves   = 0;

        boolean labFailed = false;

        for (JourneyEventDto ev : timeline) {
            String t = ev.getType();
            if (t == null) continue;

            t = t.toUpperCase(Locale.ROOT);

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
        timelineScore -= actionsCount * 1;
        timelineScore -= Math.min(deviceMoves, 10);

        if (timelineScore < 0) timelineScore = 0;

        // if lab failed → hard drop
        if (labFailed) timelineScore = Math.min(timelineScore, 40);

        // ---------------------------------------------------------------------
        // 2) COLD CHAIN SCORE from service (0–100)  -> by BATCH CODE
        // ---------------------------------------------------------------------
        int coldChainScore = boxReadingsService.calculateColdChainScore(batch.getBatchCode());

        // ---------------------------------------------------------------------
        // 3) LAB SCORE (0–100)
        // ---------------------------------------------------------------------
        int labScore = labFailed ? 20 : 95;

        // ---------------------------------------------------------------------
        // 4) FINAL HYBRID SCORE — OPTION A
        // ---------------------------------------------------------------------
        double finalScoreD =
                0.6 * coldChainScore +
                0.3 * timelineScore +
                0.1 * labScore;

        int finalScore = (int) Math.round(finalScoreD);
        if (finalScore < 0) finalScore = 0;
        if (finalScore > 100) finalScore = 100;

        // -----------------------------------------------------------
        // 5) QUALITY STATUS + CONSUMER MESSAGE
        // -----------------------------------------------------------
        String qualityStatus;
        String qualityMessage;

        if (finalScore >= 85) {
            qualityStatus = "SAFE";
            qualityMessage = "Tulsi quality is excellent. Storage conditions remained stable.";
        } else if (finalScore >= 60) {
            qualityStatus = "MODERATE";
            qualityMessage = "Tulsi quality is acceptable. Minor storage deviations detected.";
        } else {
            qualityStatus = "RISKY";
            qualityMessage = "Significant storage or handling issues detected. Use with caution.";
        }

        // -----------------------------------------------------------
        // 6) RECALL STATUS (based on Batch.status)
        // -----------------------------------------------------------
        boolean recalled = batch.getStatus() != null && batch.getStatus() != BatchStatus.NORMAL;
        String recallStatus;
        if (recalled) {
            recallStatus = "RECALLED";
            // If recalled, override quality to be clearly risky
            qualityStatus = "RISKY";
            qualityMessage = "This batch has been recalled. Do not consume.";
        } else {
            recallStatus = "NO_RECALL";
        }

        // summary text
        String summary = String.format(
                "Journey recorded %d updates: %d alerts, %d actions, %d lab checks and %d device events. Final Tulsi quality score: %d/100.",
                totalEvents, alertsCount, actionsCount, labCount, deviceMoves, finalScore
        );

        // ---------------------------------------------------------------------
        // FINAL OUTPUT
        // ---------------------------------------------------------------------
        Map<String, Object> out = new HashMap<>();
        out.put("batch", BatchDto.from(batch));
        out.put("timeline", timeline);
        out.put("qualityScore", finalScore);
        out.put("journeySummary", summary);
        out.put("qualityStatus", qualityStatus);
        out.put("qualityMessage", qualityMessage);
        out.put("recallStatus", recallStatus);  // NEW

        return ResponseEntity.ok(out);
    }

    private static Instant parseIsoSafe(String s) {
        if (s == null || s.isBlank()) return Instant.EPOCH;
        try {
            return Instant.parse(s);
        } catch (DateTimeParseException ex) {
            try {
                return Instant.parse(s.replace(" ", "T"));
            } catch (Exception e) {
                return Instant.EPOCH;
            }
        }
    }

    private static String safeIso(String s) {
        if (s == null) return "";
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
