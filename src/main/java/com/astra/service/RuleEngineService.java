package com.astra.service;

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

    // knobs
    private static final long   COOLDOWN_SECS = 60;           // wait at least 60s between flips
    private static final String TYPE_ON       = "peltier_on";
    private static final String TYPE_OFF      = "peltier_off";

    public RuleEngineService(EventService eventService,
                             DeviceThresholdRepository thresholdRepo,
                             EventRepository eventRepo,
                             ActuatorService actuatorService) {
        this.eventService   = eventService;
        this.thresholdRepo  = thresholdRepo;
        this.eventRepo      = eventRepo;
        this.actuatorService = actuatorService;
    }

    public void evaluate(String boxId, double temp) {
        // 1) thresholds
        DeviceThreshold th = thresholdRepo.findById(boxId).orElse(null);
        if (th == null) {
            System.out.println("[rules] box=" + boxId + " action=SKIP_NO_THRESH temp=" + temp);
            return;
        }
        double on  = th.getTempOn();
        double off = th.getTempOff();

        // 2) hysteresis sanity
        if (on <= off) {
            System.out.println("[rules] box=" + boxId + " action=BAD_HYSTERESIS on=" + on + " off=" + off + " -> skipping");
            return;
        }

        // 3) last known state from events (default OFF)
        Optional<Event> lastState = eventRepo.findTopByBoxIdAndTypeInOrderByTsDesc(
                boxId, List.of(TYPE_ON, TYPE_OFF)
        );
        String current = lastState.map(Event::getType).orElse(TYPE_OFF);
        LocalDateTime lastTs = lastState.map(Event::getTs).orElse(null);

        // 4) cooldown (anti-flap)
        if (lastTs != null) {
            long since = Duration.between(lastTs, LocalDateTime.now()).getSeconds();
            if (since < COOLDOWN_SECS) {
                System.out.println("[rules] box=" + boxId + " temp=" + temp + " on=" + on + " off=" + off
                        + " current=" + (TYPE_ON.equals(current) ? "ON" : "OFF")
                        + " action=SKIP_COOLDOWN elapsed=" + since + "s need>=" + COOLDOWN_SECS + "s");
                return;
            }
        }

        // 5) hysteresis decision
        if (temp >= on && !TYPE_ON.equals(current)) {
            System.out.println("[rules] box=" + boxId + " temp=" + temp + " on=" + on + " off=" + off
                    + " current=OFF action=PUBLISH_ON");
            eventService.emit(boxId, TYPE_ON, Map.of("temp", temp, "reason", "auto"), "auto");
            System.out.println("⚙️ Calling actuator: ON for " + boxId);
            actuatorService.setPeltier(boxId, true);
            return;
        }

        if (temp <= off && TYPE_ON.equals(current)) {
            System.out.println("[rules] box=" + boxId + " temp=" + temp + " on=" + on + " off=" + off
                    + " current=ON action=PUBLISH_OFF");
            eventService.emit(boxId, TYPE_OFF, Map.of("temp", temp, "reason", "auto"), "auto");
            System.out.println("⚙️ Calling actuator: OFF for " + boxId);
            actuatorService.setPeltier(boxId, false);
            return;
        }

        // 6) middle band → hold current
        System.out.println("[rules] box=" + boxId + " temp=" + temp + " on=" + on + " off=" + off
                + " current=" + (TYPE_ON.equals(current) ? "ON" : "OFF")
                + " action=HOLD_HYSTERESIS");
    }
}
