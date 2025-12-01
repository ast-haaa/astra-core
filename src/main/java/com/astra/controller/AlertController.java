package com.astra.controller;

import com.astra.api.dto.AlertActionRequest;
import com.astra.api.dto.AlertDto;
import com.astra.model.Alert;
import com.astra.model.AlertAction;
import com.astra.model.Batch;
import com.astra.model.BatchStatus;
import com.astra.repository.AlertActionRepository;
import com.astra.repository.AlertRepository;
import com.astra.repository.BatchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AlertController: exposes alert list + action endpoint.
 * This version also creates an AlertAction audit record and updates Batch status
 * if batchCode is present on the Alert entity.
 */
@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertRepository alertRepository;
    private final AlertActionRepository alertActionRepository;
    private final BatchRepository batchRepository;

    public AlertController(AlertRepository alertRepository,
                           AlertActionRepository alertActionRepository,
                           BatchRepository batchRepository) {
        this.alertRepository = alertRepository;
        this.alertActionRepository = alertActionRepository;
        this.batchRepository = batchRepository;
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

                    // --- create audit log in alert_actions table ---
                    AlertAction log = new AlertAction();
                    log.setAlertId(saved.getId());
                    // attempt to set batchCode if Alert has it (most DTOs do)
                    try {
                        String batchCode = saved.getBatchCode(); // make sure Alert has getBatchCode()
                        log.setBatchCode(batchCode);
                    } catch (NoSuchMethodError | NoClassDefFoundError | Exception ignored) {
                        // if Alert doesn't expose batchCode, ignore (safe fallback)
                    }
                    log.setActionTaken(actionUpper);
                    log.setActor(request.getActor());
                    // if you add notes to AlertActionRequest later, map them here
                    log.setNotes(null);
                    alertActionRepository.save(log);

                    // --- update Batch status depending on action and batchCode (optional simple logic) ---
                    if (log.getBatchCode() != null) {
                        batchRepository.findByBatchCode(log.getBatchCode()).ifPresent(batch -> {
                            if ("RESOLVE".equals(actionUpper)) {
                                // simple heuristic: resolved alerts can bring batch back to NORMAL
                                batch.setStatus(BatchStatus.NORMAL);
                            } else if ("RECALL".equals(actionUpper)) {
                                batch.setStatus(BatchStatus.RECALLED);
                            }
                            batchRepository.save(batch);
                        });
                    }

                    return ResponseEntity.ok(AlertDto.fromEntity(saved));

                })
                .orElse(ResponseEntity.notFound().build());
    }
}
