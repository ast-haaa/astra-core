package com.astra.controller;

import com.astra.api.dto.AlertActionRequest;
import com.astra.api.dto.AlertDto;
import com.astra.model.Alert;
import com.astra.model.AlertAction;
import com.astra.model.BatchStatus;
import com.astra.repository.AlertActionRepository;
import com.astra.repository.AlertRepository;
import com.astra.repository.BatchRepository;
import com.astra.service.MqttPublisherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertRepository alertRepository;
    private final AlertActionRepository actionRepo;
    private final BatchRepository batchRepo;
    private final MqttPublisherService mqtt;

    public AlertController(AlertRepository alertRepository,
                           AlertActionRepository actionRepo,
                           BatchRepository batchRepo,
                           MqttPublisherService mqtt) {
        this.alertRepository = alertRepository;
        this.actionRepo = actionRepo;
        this.batchRepo = batchRepo;
        this.mqtt = mqtt;
    }

    @GetMapping("/open")
    public List<AlertDto> openAlerts() {
        return alertRepository.findAll().stream()
                .filter(a -> a.getStatus() == Alert.Status.OPEN)
                .map(AlertDto::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/box/{boxId}")
    public List<AlertDto> boxAlerts(@PathVariable String boxId) {
        return alertRepository.findByBoxIdAndStatus(boxId, Alert.Status.OPEN)
                .stream().map(AlertDto::fromEntity)
                .collect(Collectors.toList());
    }

@PostMapping("/{id}/ack")
public ResponseEntity<?> ack(@PathVariable Long id) {
    return alertRepository.findById(id).map(a -> {

        a.setAcknowledgedAt(LocalDateTime.now());
        a.setStatus(Alert.Status.ACKED);

        alertRepository.save(a);

        return ResponseEntity.ok(Map.of("ok", true));
    }).orElse(ResponseEntity.notFound().build());
}



    @PostMapping("/{id}/action")
    public ResponseEntity<?> action(@PathVariable Long id,
                                    @RequestBody AlertActionRequest req) {

        return alertRepository.findById(id).map(alert -> {

            String a = req.getAction().toUpperCase();

            switch (a) {
                case "RESOLVE" -> alert.setStatus(Alert.Status.RESOLVED);
                case "IGNORE" -> alert.setStatus(Alert.Status.IGNORED);
                case "HALT" -> alert.setStatus(Alert.Status.HALTED);
                case "RECALL" -> alert.setStatus(Alert.Status.RECALLED);
            }

            alertRepository.save(alert);

            // -------- FIX: BatchCode from Alert.BATCH -------
            String batchCode = alert.getBatch() != null ? alert.getBatch().getBatchCode() : null;

            AlertAction log = new AlertAction();
            log.setAlertId(alert.getId());
            log.setBatchCode(batchCode);
            log.setActionTaken(a);
            log.setActor(req.getActor());
            actionRepo.save(log);

            if (batchCode != null) {
                batchRepo.findByBatchCode(batchCode).ifPresent(b -> {
                    if ("RECALL".equals(a)) b.setStatus(BatchStatus.RECALLED);
                    if ("RESOLVE".equals(a)) b.setStatus(BatchStatus.NORMAL);
                    batchRepo.save(b);
                });
            }

            return ResponseEntity.ok(AlertDto.fromEntity(alert));

        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/action/device")
    public ResponseEntity<?> deviceAction(@PathVariable Long id,
                                          @RequestBody Map<String,Object> req) {
        return alertRepository.findById(id).map(a -> {

            String actionType = (String) req.getOrDefault("actionType", "PELTIER_ON");
            Map<String,Object> params = (Map<String,Object>) req.getOrDefault("params", Map.of());

            String topic = "boxes/" + a.getBoxId() + "/commands";

            Map<String,Object> payload = Map.of(
                    "cmd", "actuator",
                    "action", actionType,
                    "params", params,
                    "reqId", UUID.randomUUID().toString()
            );

            mqtt.publish(topic, payload);

            a.setActionType(actionType);
            a.setActionParams(payload.toString());
            a.setActionTakenAt(LocalDateTime.now());
            a.setStatus(Alert.Status.RESOLVED);
            alertRepository.save(a);

            return ResponseEntity.ok(Map.of("ok", true, "topic", topic));
        }).orElse(ResponseEntity.notFound().build());
    }
}
