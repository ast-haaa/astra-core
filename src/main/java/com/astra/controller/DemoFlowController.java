package com.astra.controller;

import com.astra.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoFlowController {

    private final BatchRepository batchRepository;

    @GetMapping("/flow/{batchCode}")
    public ResponseEntity<?> demo(@PathVariable String batchCode) {

        boolean exists = batchRepository.existsByBatchCode(batchCode);

        if (!exists) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(Map.of(
                "steps", new String[]{
                        "IoT sensor ingestion",
                        "Cold chain monitoring",
                        "Alert generation",
                        "Batch creation",
                        "Lab approval",
                        "Shipment tracking",
                        "Consumer journey",
                        "Trust score calculation"
                },
                "status", "READY_FOR_DEMO",
                "batchCode", batchCode
        ));
    }
}
