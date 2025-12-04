package com.astra.service;

import com.astra.api.dto.AlertDto;
import com.astra.model.Alert;
import com.astra.model.Batch;
import com.astra.model.User;
import com.astra.repository.AlertRepository;
import com.astra.repository.AlertTemplateRepository;
import com.astra.repository.BatchRepository;
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
    private final BatchRepository batchRepo;
    private final UserRepository userRepo;
    private final TranslationService translationService;
    private final DeviceStateRepository deviceStateRepo;

    // ----------------------------------------
    // ⭐ NEW METHOD → GPS JSON fetch
    // ----------------------------------------
    public String getLastLocationJson(String deviceId) {
        try {
            return deviceStateRepo.findLastLocation(deviceId);
        } catch (Exception e) {
            return null; // fail-safe
        }
    }

    // ----------------------------------------
    // Build text from template
    // ----------------------------------------
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

    // ----------------------------------------
    // Create alert safely — never null fields
    // ----------------------------------------
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

        // device_id fallback
        alert.setDeviceId(deviceId != null ? deviceId : boxId);

        // ⭐ reason fallback (cannot be null)
        String reason = null;
        if (params != null) reason = params.get("reason");

        if (reason == null || reason.isBlank()) {
            reason = templateCode;
        }
        alert.setReason(reason);

        alert.setStatus(status != null ? status : Alert.Status.OPEN);

        return alertRepo.save(alert);
    }

    // ----------------------------------------
    // Alerts for Farmer
    // ----------------------------------------
    public List<AlertDto> getAlertsForFarmer(Long farmerId) {

        String lang = "en";
        if (farmerId != null) {
            User farmer = userRepo.findById(farmerId).orElse(null);
            if (farmer != null && farmer.getLangPref() != null) {
                lang = farmer.getLangPref();
            }
        }

        List<Alert> alerts = alertRepo.findAll();
        final String flang = lang;

        return alerts.stream()
                .map(a -> toDto(a, flang))
                .collect(Collectors.toList());
    }

    public AlertDto getAlertById(Long alertId, Long userId) {

        String lang = "en";

        Alert alert = alertRepo.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        return toDto(alert, lang);
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
}
