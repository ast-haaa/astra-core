package com.astra.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// NOTE: This is a skeleton controller with comments explaining where to implement logic.
// Implement validation, service injection and actual logic as described in the project playbook.

@RestController
@RequestMapping("/api")
public class BatchController {

    // Inject EventService and BatchService (implement these in src/main/java/com/astra/service)
    // private final EventService eventService;
    //
    // public BatchController(EventService eventService) {
    //     this.eventService = eventService;
    // }

    @PostMapping("/batch")
    public ResponseEntity<?> createBatch(@RequestBody String body) {
        // TODO: parse request body to CreateBatchDto, persist batch, return QR URL
        return ResponseEntity.status(201)
                .body("{\"status\":\"created\",\"note\":\"implement createBatch\"}");
    }

    @PostMapping("/batch/{batchId}/event")
    public ResponseEntity<?> ingestEvent(@PathVariable String batchId, @RequestBody String body) {
        // TODO:
        // 1. Validate payload (deviceId, eventUuid, timestamp)
        // 2. Call eventService.ingestEvent(batchId, parsedDto)
        // 3. Return accepted + dataHash + txId (if available)
        return ResponseEntity.ok("{\"status\":\"accepted\",\"eventUuid\":\"TODO\",\"dataHash\":\"TODO\"}");
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<?> getBatch(@PathVariable String batchId) {
        // TODO: return batch metadata + events
        return ResponseEntity.ok("{\"batchId\":\"" + batchId + "\",\"events\":[]}");
    }

    @GetMapping("/batch/{batchId}/verify")
    public ResponseEntity<?> verifyBatch(@PathVariable String batchId) {
        // TODO: call verification service that compares DB hash vs on-chain hash
        return ResponseEntity.ok("{\"batchId\":\"" + batchId + "\",\"verification\":[]}");
    }
}
