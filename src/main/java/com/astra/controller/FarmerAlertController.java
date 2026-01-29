package com.astra.controller;

import com.astra.api.dto.AlertDto;
import com.astra.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/farmer/alerts")
@RequiredArgsConstructor
public class FarmerAlertController {

    private final AlertService alertService;

    // 1️⃣ Multilingual Alert List for Farmer (DEMO SAFE)
    @GetMapping
    public ResponseEntity<List<AlertDto>> listMyAlerts(
            @RequestParam(defaultValue = "en") String lang
    ) {
        // ✅ DEMO MODE farmer id
        Long farmerId = 1L;

        List<AlertDto> alerts = alertService.getAlertsForFarmer(farmerId, lang);
        return ResponseEntity.ok(alerts);
    }

    // 2️⃣ Single Alert (DEMO SAFE)
    @GetMapping("/{id}")
    public ResponseEntity<AlertDto> getAlert(
            @PathVariable Long id,
            @RequestParam(defaultValue = "en") String lang
    ) {
        Long farmerId = 1L;

        AlertDto dto = alertService.getAlertById(id, farmerId, lang);
        return ResponseEntity.ok(dto);
    }

    // 3️⃣ Resolve / Acknowledge Alert (DEMO SAFE)
    @PostMapping("/{id}/resolve")
    public ResponseEntity<?> resolveAlert(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        Long farmerId = 1L;

        String notes = null;
        if (body != null) {
            notes = body.get("notes");
        }

        alertService.resolveAlert(id, farmerId, notes);

        return ResponseEntity.ok(
                Map.of(
                        "alertId", id,
                        "status", "RESOLVED"
                )
        );
    }
}
