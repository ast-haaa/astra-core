package com.astra.controller;

import com.astra.api.dto.TelemetryMessageDto;
import com.astra.service.TelemetryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {

    private final TelemetryService telemetryService;

    public TelemetryController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    // IoT device / MQTT bridge posts here
    @PostMapping
    public ResponseEntity<?> receiveTelemetry(@RequestBody TelemetryMessageDto dto) {

        if (dto == null || dto.getBoxId() == null || dto.getBatchCode() == null) {
            return ResponseEntity.badRequest().body("boxId and batchCode required");
        }

        telemetryService.handleTelemetry(dto);

        return ResponseEntity.ok("Telemetry processed");
    }
}
