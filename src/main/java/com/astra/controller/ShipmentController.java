package com.astra.controller;

import com.astra.model.Batch;
import com.astra.model.ShipmentStatus;
import com.astra.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipment")
@RequiredArgsConstructor
public class ShipmentController {

    private final BatchRepository batchRepository;

    @PostMapping("/{batchCode}/pickup")
    public ResponseEntity<?> pickup(@PathVariable String batchCode) {
        return update(batchCode, ShipmentStatus.PICKED_UP);
    }

    @PostMapping("/{batchCode}/transit")
    public ResponseEntity<?> transit(@PathVariable String batchCode) {
        return update(batchCode, ShipmentStatus.IN_TRANSIT);
    }

    @PostMapping("/{batchCode}/delivered")
    public ResponseEntity<?> delivered(@PathVariable String batchCode) {
        return update(batchCode, ShipmentStatus.DELIVERED);
    }

    private ResponseEntity<?> update(String batchCode, ShipmentStatus status) {

        Batch batch = batchRepository.findByBatchCode(batchCode).orElse(null);

        if (batch == null) {
            return ResponseEntity.notFound().build();
        }

        batch.setShipmentStatus(status);
        batchRepository.save(batch);

        return ResponseEntity.ok(batch);
    }
}
