package com.astra.controller;

import com.astra.model.Alert;
import com.astra.service.AlertService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/alerts")
public class AdminAlertController {

    private final AlertService alertService;

    public AdminAlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping("/escalated")
    public List<Alert> getEscalatedAlerts() {
        return alertService.getEscalatedAlerts();
    }
}
