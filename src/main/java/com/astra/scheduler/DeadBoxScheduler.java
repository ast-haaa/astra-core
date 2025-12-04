package com.astra.scheduler;

import com.astra.model.Alert;
import com.astra.repository.TelemetrySnapshotRepository;
import com.astra.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DeadBoxScheduler {

    private final TelemetrySnapshotRepository snapshotRepo;
    private final AlertService alertService;

    // spam control
    private final Map<String, Long> lastDeadAlert = new HashMap<>();

    @Scheduled(fixedRate = 60_000) // every 1 min
    public void checkDeadBoxes() {

        // repo method exists exactly like this:
        List<Object[]> rows = snapshotRepo.findLastSeenForAllBoxes();

        long now = System.currentTimeMillis();

        for (Object[] row : rows) {
            String boxId = (String) row[0];
            Instant ts   = (Instant) row[1];   // TelemetrySnapshot.timestamp is Instant

            if (boxId == null || ts == null) continue;

            long seconds = Duration.between(ts, Instant.now()).toSeconds();

            // 180s = 3 minutes dead
            if (seconds > 180) {

                long last = lastDeadAlert.getOrDefault(boxId, 0L);

                if (now - last > 180_000L) { // 3 min spam control

                    alertService.createFromTemplate(
                            "DEAD_BOX",
                            Map.of(
                                    "boxId", boxId,
                                    // Map<String,String> chahiye → String.valueOf(...)
                                    "minutes", String.valueOf(seconds / 60)
                            ),
                            null,
                            boxId,
                            boxId,
                            Alert.Status.OPEN
                    );

                    System.out.println("🚨 DEAD BOX ALERT → " + boxId + " (silent " + seconds + "s)");

                    lastDeadAlert.put(boxId, now);
                }
            }
        }
    }
}
