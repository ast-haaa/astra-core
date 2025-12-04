package com.astra.service;

import com.astra.model.Alert;
import com.astra.model.DeviceThreshold;
import com.astra.model.Event;
import com.astra.repository.DeviceThresholdRepository;
import com.astra.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class RuleEngineService {

    private final EventService eventService;
    private final DeviceThresholdRepository thresholdRepo;
    private final EventRepository eventRepo;
    private final ActuatorService actuatorService;
    private final AlertService alertService;

    private static final long COOLDOWN_SECS = 60;
    private static final String TYPE_ON = "peltier_on";
    private static final String TYPE_OFF = "peltier_off";

    private static final double TULSI_TEMP_LOW = 10.0;
    private static final double TULSI_TEMP_HIGH = 30.0;

    public RuleEngineService(EventService eventService,
                             DeviceThresholdRepository thresholdRepo,
                             EventRepository eventRepo,
                             ActuatorService actuatorService,
                             AlertService alertService) {
        this.eventService = eventService;
        this.thresholdRepo = thresholdRepo;
        this.eventRepo = eventRepo;
        this.actuatorService = actuatorService;
        this.alertService = alertService;
    }

    /**
     * FINAL VERSION:
     * Only TEMP rules. Tamper handled in MqttListenerService.
     */
    public void evaluate(String boxId, double temp) {

        // TEMP-BASED ALERT LOGIC
        try {
            if (temp >= TULSI_TEMP_HIGH) {
                alertService.createFromTemplate(
                        "TEMP_HIGH",
                        Map.of(
                                "value", String.format("%.1f", temp),
                                "boxId", boxId
                        ),
                        null,
                        boxId,
                        boxId,
                        Alert.Status.OPEN
                );
            } else if (temp <= TULSI_TEMP_LOW) {
                alertService.createFromTemplate(
                        "TEMP_LOW",
                        Map.of(
                                "value", String.format("%.1f", temp),
                                "boxId", boxId
                        ),
                        null,
                        boxId,
                        boxId,
                        Alert.Status.OPEN
                );
            }
        } catch (Exception e) {
            System.out.println("[rules] Tulsi temp alert failed: " + e.getMessage());
        }

        // DEVICE THRESHOLDS
        DeviceThreshold th = thresholdRepo.findById(boxId).orElse(null);
        if (th == null) {
            System.out.println("[rules] box=" + boxId + " action=SKIP_NO_THRESH temp=" + temp);
            return;
        }

        double on = th.getTempOn();
        double off = th.getTempOff();

        if (on <= off) {
            System.out.println("[rules] box=" + boxId + " action=BAD_HYSTERESIS on=" + on + " off=" + off);
            return;
        }

        Optional<Event> lastState = eventRepo.findTopByBoxIdAndTypeInOrderByTsDesc(
                boxId, List.of(TYPE_ON, TYPE_OFF)
        );

        String current = lastState.map(Event::getType).orElse(TYPE_OFF);
        LocalDateTime lastTs = lastState.map(Event::getTs).orElse(null);

        // COOLDOWN LOGIC
        if (lastTs != null) {
            long since = Duration.between(lastTs, LocalDateTime.now()).getSeconds();
            if (since < COOLDOWN_SECS) {
                System.out.println("[rules] box=" + boxId + " temp=" + temp
                        + " current=" + current + " action=SKIP_COOLDOWN");
                return;
            }
        }

        // TURN ON
        if (temp >= on && !TYPE_ON.equals(current)) {
            System.out.println("[rules] ON → " + boxId);
            eventService.emit(boxId, TYPE_ON, Map.of("temp", temp, "reason", "auto"), "auto");
            actuatorService.setPeltier(boxId, true);
            return;
        }

        // TURN OFF
        if (temp <= off && TYPE_ON.equals(current)) {
            System.out.println("[rules] OFF → " + boxId);
            eventService.emit(boxId, TYPE_OFF, Map.of("temp", temp, "reason", "auto"), "auto");
            actuatorService.setPeltier(boxId, false);
            return;
        }

        // NO CHANGE
        System.out.println("[rules] HOLD → " + boxId);
    }
}
