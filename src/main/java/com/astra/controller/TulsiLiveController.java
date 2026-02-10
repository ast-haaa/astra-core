package com.astra.controller;

import com.astra.model.Telemetry;
import com.astra.repository.TelemetryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tulsi")
@CrossOrigin(origins = "*")
public class TulsiLiveController {

    private final TelemetryRepository telemetryRepository;

    public TulsiLiveController(TelemetryRepository telemetryRepository) {
        this.telemetryRepository = telemetryRepository;
    }


   @GetMapping("/live")
public ResponseEntity<?> getTulsiLiveData() {

    return telemetryRepository
            .findTopByBoxIdOrderByTimestampDesc("BOX_TULSI_001")
            .map(t -> ResponseEntity.ok(Map.of(
                    "temperature", t.getTemperature(),
                    "humidity", t.getHumidity(),
                    "peltier", "OFF"
            )))
            .orElse(ResponseEntity.ok(Map.of(
                    "temperature", 0,
                    "humidity", 0,
                    "peltier", "OFF"
            )));

        }

}
