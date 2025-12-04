package com.astra.controller;

import com.astra.api.dto.AlertDto;
import com.astra.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/alerts")
@RequiredArgsConstructor
public class FarmerAlertController {

    private final AlertService alertService;

    // ---------------------------------------
    // 1) Multilingual Alert List for Farmer
    // ---------------------------------------
    @GetMapping
public ResponseEntity<List<AlertDto>> listMyAlerts(
        @RequestParam(required = false) Long farmerId
) {
    Long effectiveId = (farmerId != null) ? farmerId : 1L;
    List<AlertDto> alerts = alertService.getAlertsForFarmer(effectiveId);
    return ResponseEntity.ok(alerts);
}


    // ---------------------------------------
    // 2) Single Alert (Multilingual)
    // ---------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<AlertDto> getAlert(
            @PathVariable Long id
    ) {
        Long farmerId = 1L;  // SAME TEMPORARY MATCHING FARMER

        AlertDto dto = alertService.getAlertById(id, farmerId);
        return ResponseEntity.ok(dto);
    }
}
