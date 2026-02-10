package com.astra.controller;

import com.astra.model.Batch;
import com.astra.repository.BatchRepository;
import com.astra.service.BoxReadingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/trust")
@RequiredArgsConstructor
public class TrustScoreController {

    private final BatchRepository batchRepository;
    private final BoxReadingsService boxReadingsService;

    @GetMapping("/{batchCode}")
    public ResponseEntity<?> getTrustScore(@PathVariable String batchCode) {

        Batch batch = batchRepository.findByBatchCode(batchCode).orElse(null);

        if (batch == null) {
            return ResponseEntity.notFound().build();
        }

        int coldChainScore = boxReadingsService.calculateColdChainScore(batch.getBoxId());

        int base = batch.getLabResult().name().contains("FAIL") ? 40 : 90;

        int finalScore = (int) (coldChainScore * 0.7 + base * 0.3);
        finalScore = Math.max(0, Math.min(100, finalScore));

        String verdict =
                finalScore >= 85 ? "SAFE" :
                finalScore >= 60 ? "MODERATE" :
                "RISKY";

        return ResponseEntity.ok(Map.of(
                "batchCode", batchCode,
                "coldChainScore", coldChainScore,
                "finalTrustScore", finalScore,
                "verdict", verdict
        ));
    }
}
