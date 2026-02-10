package com.astra.controller;

import com.astra.api.dto.AckDTO;
import com.astra.model.AckRecord;
import com.astra.service.AckService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/acks")
public class AckController {
    private final AckService ackService;

    public AckController(AckService ackService) {
        this.ackService = ackService;
    }

    @PostMapping
    public ResponseEntity<AckRecord> receiveAck(@RequestBody AckDTO dto) {
        if (dto == null || dto.getBoxId() == null || dto.getBoxId().isBlank()) {
            return ResponseEntity.badRequest().body(null);
        }
        AckRecord a = new AckRecord();
        a.setBoxId(dto.getBoxId());
        a.setMessage(dto.getMessage());
        a.setTimestamp(dto.getTimestamp() != null ? dto.getTimestamp() : Instant.now());
        AckRecord saved = ackService.save(a);
        return ResponseEntity.created(URI.create("/api/acks/" + saved.getId())).body(saved);
    }

    @GetMapping("/box/{boxId}")
    public ResponseEntity<List<AckRecord>> byBox(@PathVariable String boxId) {
        List<AckRecord> list = ackService.findByBox(boxId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/cmd/{boxId}")
    public ResponseEntity<?> sendCommand(@PathVariable String boxId, @RequestBody String payload) {
        if (boxId == null || boxId.isBlank()) return ResponseEntity.badRequest().body("boxId required");
        // If MqttPublisher exists, it will be used later in step 3 to publish.
        return ResponseEntity.accepted().body("Command queued to " + boxId);
    }
}
