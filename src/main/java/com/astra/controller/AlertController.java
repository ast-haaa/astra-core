package com.astra.controller;

import com.astra.api.dto.AlertActionRequest;
import com.astra.api.dto.AlertDto;
import com.astra.model.Alert;
import com.astra.repository.AlertRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertRepository alertRepository;

    public AlertController(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    // 1) Get all OPEN alerts (for dashboard)
    @GetMapping("/open")
    public ResponseEntity<List<AlertDto>> getOpenAlerts() {
        List<Alert> alerts = alertRepository.findAll()
                .stream()
                .filter(a -> a.getStatus() == Alert.Status.OPEN)
                .collect(Collectors.toList());

        List<AlertDto> dtoList = alerts.stream()
                .map(AlertDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    // 2) Get alerts by box
    @GetMapping("/box/{boxId}")
    public ResponseEntity<List<AlertDto>> getAlertsByBox(@PathVariable String boxId) {
        List<Alert> alerts = alertRepository.findByBoxIdAndStatus(boxId, Alert.Status.OPEN);

        List<AlertDto> dtoList = alerts.stream()
                .map(AlertDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    // 3) Change alert status (resolve / ignore / halt / recall)
   @PostMapping("/{id}/action")
public ResponseEntity<AlertDto> takeActionOnAlert(
        @PathVariable Long id,
        @RequestBody AlertActionRequest request
) {

    return alertRepository.findById(id)
            .map(alert -> {

                if (request.getAction() == null) {
                    return ResponseEntity.badRequest().<AlertDto>build();
                }

                String actionUpper = request.getAction().toUpperCase();

                switch (actionUpper) {
                    case "RESOLVE":
                        alert.setStatus(Alert.Status.RESOLVED);
                        break;
                    case "IGNORE":
                        alert.setStatus(Alert.Status.IGNORED);
                        break;
                    case "HALT":
                        alert.setStatus(Alert.Status.HALTED);
                        break;
                    case "RECALL":
                        alert.setStatus(Alert.Status.RECALLED);
                        break;
                    default:
                        return ResponseEntity.badRequest().<AlertDto>build();
                }

                alert.setActionTakenBy(request.getActor());

                Alert saved = alertRepository.save(alert);
                return ResponseEntity.ok(AlertDto.fromEntity(saved));

            })
            .orElse(ResponseEntity.notFound().build());
}
}
