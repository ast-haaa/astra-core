package com.astra.controller;

import com.astra.model.Alert;
import com.astra.model.User;
import com.astra.repository.AlertRepository;
import com.astra.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugCallController {

    private final NotificationService notificationService;
    private final AlertRepository alertRepo;

    // private final UserRepository userRepo;  // abhi test ke liye use nahi kar rahe

    @PostMapping("/test-call")
    public ResponseEntity<Map<String, String>> testCall(
            @RequestParam Long alertId
    ) {
        Alert alert = alertRepo.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));

        // 🔹 DUMMY USER for testing (no DB lookup)
        User farmer = new User();
        farmer.setId(999L);                 // koi bhi fake id
        farmer.setName("Test Farmer");
        farmer.setMobile("8869892337"); // yaha apna actual mobile no. daalna
        farmer.setLangPref("hi");           // "en", "hi", "mr", "gu" etc

        notificationService.sendAlertNotification(alert, farmer);

        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "message", "Call trigger sent to " + farmer.getMobile()
        ));
    }
}
