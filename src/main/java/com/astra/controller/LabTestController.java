package com.astra.controller;

import com.astra.api.dto.*;
import com.astra.model.*;
import com.astra.repository.BatchRepository;
import com.astra.repository.LabTestRepository;
import com.astra.service.LabDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lab")
public class LabTestController {

    private final LabTestRepository labTestRepository;
    private final BatchRepository batchRepository;
    private final LabDashboardService labDashboardService;

    public LabTestController(LabTestRepository labTestRepository,
                             BatchRepository batchRepository,
                             LabDashboardService labDashboardService) {
        this.labTestRepository = labTestRepository;
        this.batchRepository = batchRepository;
        this.labDashboardService = labDashboardService;
    }

    // =========================
    // CREATE LAB TEST
    // =========================
    @PostMapping("/tests")
    public ResponseEntity<?> createTest(@RequestBody CreateLabTestRequest req) {

        if (req.getBatchCode() == null || req.getResult() == null) {
            return ResponseEntity.badRequest().body("Batch code and result required");
        }

        Batch batch = batchRepository.findByBatchCode(req.getBatchCode())
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        LabTest test = new LabTest();
        test.setBatchCode(req.getBatchCode());
        test.setResult(req.getResult());
        test.setSummary(req.getSummary());
        test.setReportUrl(req.getReportUrl());
        test.setTester(req.getTester());

        LabTest saved = labTestRepository.save(test);

        batch.setLabResult(req.getResult());

        if (req.getResult() == LabResult.FAIL) {
            batch.setStatus(BatchStatus.REJECTED);
        } else if (req.getResult() == LabResult.PASS) {
            batch.setStatus(BatchStatus.APPROVED);
        }

        batchRepository.save(batch);

        return ResponseEntity.ok(LabTestDto.fromEntity(saved));
    }

    // =========================
    // APPROVE BATCH
    // =========================
    @PostMapping("/batches/{batchCode}/approve")
    public ResponseEntity<?> approveBatch(@PathVariable String batchCode) {
        return batchRepository.findByBatchCode(batchCode)
                .map(batch -> {
                    batch.setStatus(BatchStatus.APPROVED);
                    batch.setLabResult(LabResult.PASS);
                    batchRepository.save(batch);
                    return ResponseEntity.ok("Batch approved");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================
    // RECALL BATCH
    // =========================
    @PostMapping("/batches/{batchCode}/recall")
    public ResponseEntity<?> recallBatch(
            @PathVariable String batchCode,
            @RequestBody RecallRequest req
    ) {
        return batchRepository.findByBatchCode(batchCode)
                .map(batch -> {
                    batch.setStatus(BatchStatus.RECALLED);
                    batch.setRecallReason(req.getReason());
                    batchRepository.save(batch);
                    return ResponseEntity.ok("Batch recalled");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================
    // GET TESTS FOR BATCH
    // =========================
    @GetMapping("/tests")
    public ResponseEntity<List<LabTestDto>> getTests(@RequestParam String batchCode) {
        List<LabTest> list = labTestRepository.findByBatchCodeOrderByCreatedAtDesc(batchCode);

        List<LabTestDto> dto = list.stream()
                .map(LabTestDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dto);
    }

    // =========================
    // PROCESSED BATCHES
    // =========================
    @GetMapping("/batches/processed")
    public ResponseEntity<List<Batch>> getProcessedBatches() {
        List<Batch> list = batchRepository.findByStatusIn(
                List.of(BatchStatus.APPROVED, BatchStatus.REJECTED, BatchStatus.RECALLED)
        );
        return ResponseEntity.ok(list);
    }

    // =========================
    // DASHBOARD
    // =========================
    @GetMapping("/dashboard")
    public ResponseEntity<LabDashboardDto> getDashboard() {
        return ResponseEntity.ok(labDashboardService.getSummary());
    }

    // =========================
    // LIST BATCHES FOR LAB
    // =========================
    @GetMapping("/batches")
    public ResponseEntity<List<LabBatchDto>> getAllProcessedBatches() {

        List<Batch> batches = batchRepository.findByStatusIn(
                List.of(BatchStatus.APPROVED, BatchStatus.REJECTED, BatchStatus.RECALLED)
        );

        List<LabBatchDto> dto = batches.stream()
                .map(b -> new LabBatchDto(
                        b.getBatchCode(),
                        b.getHerbName(),
                        b.getStatus(),
                        b.getLabResult(),
                        b.getRecallReason()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dto);
    }

    // =========================
    // BATCH DETAIL
    // =========================
    @GetMapping("/batches/{batchCode}")
    public ResponseEntity<?> getBatchDetail(@PathVariable String batchCode) {

        Batch batch = batchRepository.findByBatchCode(batchCode)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        List<LabTest> tests = labTestRepository
                .findByBatchCodeOrderByCreatedAtDesc(batchCode);

        List<LabTestDto> testDtos = tests.stream()
                .map(LabTestDto::fromEntity)
                .collect(Collectors.toList());

        LabBatchDetailDto dto = new LabBatchDetailDto(
                batch.getBatchCode(),
                batch.getHerbName(),
                batch.getStatus(),
                batch.getLabResult(),
                batch.getRecallReason(),
                testDtos
        );

        return ResponseEntity.ok(dto);
    }

    // =========================
    // CREATE BATCH (LAB SIDE)
    // =========================
    @PostMapping("/batches")
    public ResponseEntity<?> createBatch(@RequestBody CreateBatchRequest req) {

        if (req.getBatchCode() == null || req.getHerbName() == null) {
            return ResponseEntity.badRequest().body("Batch code & herb name required");
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
        batch.setStatus(BatchStatus.PENDING);
        batch.setLabResult(LabResult.NOT_TESTED);

        batchRepository.save(batch);

        return ResponseEntity.ok(batch);
    }

    // =========================
    // PENDING BATCHES
    // =========================
    @GetMapping("/batches/pending")
    public ResponseEntity<List<Batch>> getPendingBatches() {
        return ResponseEntity.ok(
                batchRepository.findByStatus(BatchStatus.PENDING)
        );
    }
}
