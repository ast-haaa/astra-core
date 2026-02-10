package com.astra.service;

import com.astra.model.Batch;
import com.astra.model.BatchStatus;
import com.astra.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RecallService {

    private final BatchRepository batchRepository;
    private final BlockchainService blockchainService;

    // demo-safe constants
    private static final int MAX_IGNORED_ALERTS = 3;
    private static final int CRITICAL_MINUTES_FOR_RECALL = 30;

    public boolean shouldRecall(
            Batch batch,
            int ignoredAlerts,
            boolean failsafeTriggered,
            boolean labFailed,
            LocalDateTime criticalSince
    ) {
        if (batch == null || criticalSince == null) return false;

        long criticalMins =
                Duration.between(criticalSince, LocalDateTime.now()).toMinutes();

        return ignoredAlerts >= MAX_IGNORED_ALERTS
                && failsafeTriggered
                && labFailed
                && criticalMins >= CRITICAL_MINUTES_FOR_RECALL;
    }

    public void triggerRecall(Batch batch, String reason) {

        // ✅ BLOCKCHAIN ANCHOR (SAFE)
        try {
            blockchainService.anchor(
                    "BATCH_RECALLED|" +
                    batch.getBatchCode() +
                    "|REASON=" + reason +
                    "|TIME=" + LocalDateTime.now()
            );
        } catch (Exception e) {
            System.err.println("[blockchain] recall anchor failed: " + e.getMessage());
        }

        batch.setStatus(BatchStatus.RECALLED);
        batch.setRecallReason(reason);
        batchRepository.save(batch);
    }
}
