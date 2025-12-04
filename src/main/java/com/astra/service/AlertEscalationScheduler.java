package com.astra.service;

import com.astra.model.Alert;
import com.astra.repository.AlertRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AlertEscalationScheduler {

    private final AlertRepository alertRepository;

    public AlertEscalationScheduler(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @Scheduled(fixedRateString = "${alerts.escalation.check.ms:60000}")
    public void checkExpired() {
        LocalDateTime now = LocalDateTime.now();
        // find alerts that are Open or Acked, with deadline before now and not yet escalated
        List<Alert> expired = alertRepository.findByStatusInAndDeadlineBeforeAndEscalated(
                List.of(Alert.Status.OPEN, Alert.Status.ACKED),
                now,
                false
        );
        for (Alert a : expired) {
            a.setEscalated(true);
            a.setEscalationMarkedAt(now);
            a.setStatus(Alert.Status.ESCALATED);
            alertRepository.save(a);
            // optional: notify transporter/admin, or mark for blockchain
        }
    }
}