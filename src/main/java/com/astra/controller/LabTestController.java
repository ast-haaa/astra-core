package com.astra.controller;

import com.astra.api.dto.CreateLabTestRequest;
import com.astra.api.dto.LabTestDto;
import com.astra.model.Batch;
import com.astra.model.BatchStatus;
import com.astra.model.LabTest;
import com.astra.model.LabResult;
import com.astra.repository.BatchRepository;
import com.astra.repository.LabTestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lab")
public class LabTestController {

    private final LabTestRepository labTestRepository;
    private final BatchRepository batchRepository;

    public LabTestController(LabTestRepository labTestRepository,
                             BatchRepository batchRepository) {
        this.labTestRepository = labTestRepository;
        this.batchRepository = batchRepository;
    }

    // create a lab test (simple)
    @PostMapping("/tests")
    public ResponseEntity<LabTestDto> createTest(@RequestBody CreateLabTestRequest req) {
        if (req.getBatchCode() == null || req.getResult() == null) {
            return ResponseEntity.badRequest().build();
        }

        LabTest test = new LabTest();
        test.setBatchCode(req.getBatchCode());
        test.setResult(req.getResult());
        test.setSummary(req.getSummary());
        test.setReportUrl(req.getReportUrl());
        test.setTester(req.getTester());

        LabTest saved = labTestRepository.save(test);

        // update batch labResult / status
        batchRepository.findByBatchCode(req.getBatchCode()).ifPresent(batch -> {
            batch.setLabResult(req.getResult());
            if (req.getResult() == LabResult.FAIL) {
                batch.setStatus(BatchStatus.RECALL_RECOMMENDED);
            } else if (req.getResult() == LabResult.PASS) {
                // optional: if previously RISKY and now PASS, set NORMAL
                batch.setStatus(BatchStatus.NORMAL);
            }
            batchRepository.save(batch);
        });

        return ResponseEntity.ok(LabTestDto.fromEntity(saved));
    }

    // get tests for a batch
    @GetMapping("/tests")
    public ResponseEntity<List<LabTestDto>> getTests(@RequestParam String batchCode) {
        List<LabTest> list = labTestRepository.findByBatchCodeOrderByCreatedAtDesc(batchCode);
        List<LabTestDto> dto = list.stream().map(LabTestDto::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }
}
