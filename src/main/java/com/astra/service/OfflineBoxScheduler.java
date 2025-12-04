package com.astra.service;

import com.astra.model.TelemetrySnapshot;
import com.astra.repository.TelemetrySnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OfflineBoxScheduler {

    private final TelemetrySnapshotRepository repository;
    private final AlertService alertService;

    // 🚫 Disabled to avoid repeated offline spam
    // @Scheduled(fixedDelay = 60000)
    public void checkOffline() {
        List<TelemetrySnapshot> all = repository.findAll();

        // group by boxId → latest timestamp
        Map<String, Instant> latestMap = new HashMap<>();

        for (TelemetrySnapshot s : all) {
            latestMap.merge(
                    s.getBoxId(),
                    s.getTimestamp(),
                    (oldTime, newTime) -> newTime.isAfter(oldTime) ? newTime : oldTime
            );
        }

        Instant now = Instant.now();

        for (String boxId : latestMap.keySet()) {
            Instant last = latestMap.get(boxId);

            long mins = Duration.between(last, now).toMinutes();

            // OFFLINE threshold = 5 mins
            if (mins >= 5) {
                alertService.createFromTemplate(
                        "BOX_OFFLINE",
                        Map.of(
                                "boxId", boxId,
                                "lastTime", last.toString()
                        ),
                        null,
                        boxId,
                        boxId,
                        com.astra.model.Alert.Status.OPEN
                );
            }
        }
    }
}
