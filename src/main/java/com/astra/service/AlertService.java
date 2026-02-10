package com.astra.service;

import com.astra.api.dto.AlertDto;
import com.astra.model.Alert;
import com.astra.model.Batch;
import com.astra.model.User;
import com.astra.repository.AlertRepository;
import com.astra.repository.AlertTemplateRepository;
import com.astra.repository.DeviceStateRepository;
import com.astra.repository.UserRepository;
import com.astra.util.JsonUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepo;
    private final AlertTemplateRepository templateRepo;
    private final UserRepository userRepo;
    private final TranslationService translationService;
    private final DeviceStateRepository deviceStateRepo;

    public String getLastLocationJson(String deviceId) {
        try {
            return deviceStateRepo.findLastLocation(deviceId);
        } catch (Exception e) {
            return null;
        }
    }

    public String buildMessage(String templateCode, Map<String, String> params) {
        var tpl = templateRepo.findByCode(templateCode)
                .orElseThrow(() -> new RuntimeException("Template not found: " + templateCode));

        String template = tpl.getTemplate() != null ? tpl.getTemplate() : "";

        if (params != null) {
            for (var e : params.entrySet()) {
                template = template.replace("{" + e.getKey() + "}", e.getValue());
            }
        }
        return template;
    }

    public Alert createFromTemplate(
            String templateCode,
            Map<String, String> params,
            Batch batch,
            String boxId,
            String deviceId,
            Alert.Status status
    ) {
        var tpl = templateRepo.findByCode(templateCode)
                .orElseThrow(() -> new RuntimeException("Template not found: " + templateCode));

        Alert alert = new Alert();
        alert.setTemplateCode(templateCode);
        alert.setParams(JsonUtils.toJson(params));
        alert.setMessage(tpl.getTemplate());
        alert.setBatch(batch);
        alert.setBoxId(boxId);
        alert.setDeviceId(deviceId != null ? deviceId : boxId);

        String reason = null;
        if (params != null) reason = params.get("reason");
        if (reason == null || reason.isBlank()) reason = templateCode;

        alert.setReason(reason);
        alert.setStatus(status != null ? status : Alert.Status.OPEN);

        return alertRepo.save(alert);
    }

    public List<AlertDto> getAlertsForFarmer(Long farmerId, String lang) {

        if (lang == null || lang.isBlank()) {
            User farmer = userRepo.findById(farmerId).orElse(null);
            if (farmer != null && farmer.getLangPref() != null) {
                lang = farmer.getLangPref();
            } else {
                lang = "en";
            }
        }

        // ✅ FIXED CALL
List<Alert> alerts = alertRepo.findByBatch_Farmer_IdOrderByCreatedAtDesc(farmerId);

        final String flang = lang;

        return alerts.stream()
                .map(a -> toDto(a, flang))
                .collect(Collectors.toList());
    }

    private AlertDto toDto(Alert alert, String lang) {
        AlertDto dto = new AlertDto();

        dto.setId(alert.getId());
        dto.setBoxId(alert.getBoxId());
        dto.setStatus(alert.getStatus().name());
        dto.setCreatedAt(alert.getCreatedAt());
        dto.setUpdatedAt(alert.getUpdatedAt());
        dto.setParameter(alert.getParameterName());
        dto.setCurrentValue(alert.getCurrentValue());
        dto.setThresholdLow(alert.getThresholdLow());
        dto.setThresholdHigh(alert.getThresholdHigh());
        dto.setActionTakenBy(alert.getActionTakenBy());

        if (alert.getBatch() != null) {
            dto.setBatchCode(alert.getBatch().getBatchCode());
        }

        dto.setMessage(translationService.renderAlertText(alert, lang));

        return dto;
    }

    public void resolveAlert(Long alertId, Long userId, String notes) {
        Alert alert = alertRepo.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        alert.setStatus(Alert.Status.RESOLVED);
        alert.setActionTakenBy("USER:" + userId);
        alert.setActionType("RESOLVED");
        alert.setActionParams(notes);
        alert.setActionTakenAt(LocalDateTime.now());

        alertRepo.save(alert);
    }

    public AlertDto getAlertById(Long alertId, Long farmerId, String lang) {

        Alert alert = alertRepo.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        if (lang == null || lang.isBlank()) {
            lang = "en";
        }

        return toDto(alert, lang);
    }
   public List<Alert> getEscalatedAlerts() {
    return alertRepo.findByStatusInAndDeadlineBeforeAndEscalated(
            List.of(Alert.Status.OPEN),
            LocalDateTime.now(),
            true
    );
}


}
