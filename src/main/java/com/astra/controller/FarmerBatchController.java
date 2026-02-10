package com.astra.controller;

import com.astra.model.User;

import com.astra.api.dto.BatchDto;
import com.astra.model.Batch;
import com.astra.model.BatchStatus;
import com.astra.model.LabResult;
import com.astra.repository.BatchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/farmer/batches")
public class FarmerBatchController {

    private final BatchRepository batchRepository;

    // TEMP farmer id (demo mode)
    private static final Long DEMO_FARMER_ID = 1L;

    public FarmerBatchController(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    // ✅ create batch + bind IoT box
@PostMapping
public ResponseEntity<?> createBatch(@RequestBody Batch req) {

    if (req.getBatchCode() == null || req.getBoxId() == null) {
        return ResponseEntity.badRequest().body("Batch code & boxId required");
    }

    if (batchRepository.existsByBatchCode(req.getBatchCode())) {
        return ResponseEntity.badRequest().body("Batch already exists");
    }

    Batch batch = new Batch();
    batch.setBatchCode(req.getBatchCode());
    batch.setHerbName(req.getHerbName());
    batch.setFarmerName(req.getFarmerName());
    batch.setOriginLocation(req.getOriginLocation());
    batch.setBoxId(req.getBoxId());

    // ✅ SET DEMO FARMER USER (correct way)
    User demoFarmer = new User();
    demoFarmer.setId(DEMO_FARMER_ID);
    batch.setFarmer(demoFarmer);

    batch.setStatus(BatchStatus.PENDING);
    batch.setLabResult(LabResult.NOT_TESTED);

    batchRepository.save(batch);

    return ResponseEntity.ok(batch);
}



    // ✅ Farmer Batch List API
    @GetMapping
    public ResponseEntity<List<BatchDto>> getMyBatches() {

        List<Batch> list = batchRepository.findByFarmerId(DEMO_FARMER_ID);

        List<BatchDto> result = list.stream()
                .map(BatchDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
