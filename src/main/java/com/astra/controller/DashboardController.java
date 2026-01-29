package com.astra.controller;

import com.astra.api.dto.DashboardSummaryDto;
import com.astra.model.User;
import com.astra.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @PreAuthorize("hasRole('FARMER')")
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(
            Authentication authentication) {

        User farmer = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                dashboardService.getSummaryForFarmer(farmer.getId())
        );
    }
}
