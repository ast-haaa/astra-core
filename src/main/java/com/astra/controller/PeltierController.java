package com.astra.controller;

import com.astra.service.ActuatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/boxes")
@RequiredArgsConstructor
public class PeltierController {

    private final ActuatorService actuatorService;

    @PostMapping("/{boxId}/peltier")
    public ResponseEntity<?> togglePeltier(
            @PathVariable String boxId,
            @RequestBody Map<String, String> body
    ) {
        String power = body.get("power");
        if (power == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "power missing"));
        }

        boolean on = power.equalsIgnoreCase("ON");

        actuatorService.setPeltier(boxId, on);

        return ResponseEntity.ok(Map.of(
                "boxId", boxId,
                "peltier", on ? "ON" : "OFF",
                "status", "COMMAND_SENT"
        ));
    }
}
