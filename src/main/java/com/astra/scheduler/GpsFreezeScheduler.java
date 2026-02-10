package com.astra.scheduler;

import com.astra.model.Alert;
import com.astra.repository.TelemetrySnapshotRepository;
import com.astra.service.AlertService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GpsFreezeScheduler {

    private final TelemetrySnapshotRepository snapshotRepo;
    private final AlertService alertService;

    private final ObjectMapper mapper = new ObjectMapper();

    // prevent spam
    private final Map<String, Long> lastAlertMap = new HashMap<>();

    @Scheduled(fixedRate = 60_000) // every 1 min
    public void checkGpsFreeze() {

        // A — get all unique boxIds (from repo method)
        List<String> boxIds = snapshotRepo.findDistinctBoxIds();

        for (String boxId : boxIds) {

            // B — last 5 snapshots for this box
            var list = snapshotRepo.findTop5ByBoxIdOrderByTimestampDesc(boxId);
            if (list.size() < 5) continue; // not enough history

            Double lastLat = null, lastLon = null;
            boolean allSame = true;

            // check if last 5 GPS points are same
            for (var snap : list) {
                try {
                    JsonNode node = mapper.readTree(snap.getPayload());
                    JsonNode gps = node.path("gps");

                    if (gps.isMissingNode() || gps.isNull()) {
                        allSame = false;
                        break;
                    }

                    double lat = gps.path("lat").asDouble(Double.NaN);
                    double lon = gps.path("lon").asDouble(Double.NaN);

                    if (Double.isNaN(lat) || Double.isNaN(lon)) {
                        allSame = false;
                        break;
                    }

                    if (lastLat == null) {
                        lastLat = lat;
                        lastLon = lon;
                    } else if (!latEquals(lat, lastLat) || !latEquals(lon, lastLon)) {
                        allSame = false;
                        break;
                    }

                } catch (Exception ignored) {
                }
            }

            if (allSame) {
                long now = System.currentTimeMillis();
                long last = lastAlertMap.getOrDefault(boxId, 0L);

                if (now - last > 300_000L) { // 5 minutes gap

                    alertService.createFromTemplate(
                            "GPS_FROZEN",
                            Map.of("boxId", boxId),
                            null,
                            boxId,
                            boxId,
                            Alert.Status.OPEN
                    );

                    System.out.println("🧭 GPS FREEZE ALERT → " + boxId);
                    lastAlertMap.put(boxId, now);
                }
            }
        }
    }

    // small helper for comparing doubles
    private boolean latEquals(double a, double b) {
        return Math.abs(a - b) < 1e-6;
    }
}
