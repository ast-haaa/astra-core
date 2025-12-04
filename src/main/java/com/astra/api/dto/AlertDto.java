package com.astra.api.dto;

import com.astra.model.Alert;
import java.time.Instant;

public class AlertDto {

    private Long id;
    private String batchCode;
    private String boxId;
    private String message;
    private String parameter;
    private Double currentValue;
    private Double thresholdLow;
    private Double thresholdHigh;
    private String status;
    private String actionTakenBy;
    private Instant createdAt;
    private Instant updatedAt;

    // ---- factory from entity ----
    public static AlertDto fromEntity(Alert a) {
        AlertDto d = new AlertDto();
        d.id = a.getId();
        d.boxId = a.getBoxId();
        d.message = a.getMessage();               // raw message (EN)
        d.parameter = a.getParameterName();
        d.currentValue = a.getCurrentValue();
        d.thresholdLow = a.getThresholdLow();
        d.thresholdHigh = a.getThresholdHigh();
        d.status = (a.getStatus() != null) ? a.getStatus().name() : null;
        d.actionTakenBy = a.getActionTakenBy();
        d.createdAt = a.getCreatedAt();
        d.updatedAt = a.getUpdatedAt();

        if (a.getBatch() != null) {
            d.batchCode = a.getBatch().getBatchCode();
        }
        return d;
    }

    // ❌ THIS METHOD REMOVED (translationService not available in DTO)
    // private AlertDto toDto(Alert alert, String lang) { ... }

    // ---- getters & setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }

    public String getBoxId() { return boxId; }
    public void setBoxId(String boxId) { this.boxId = boxId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getParameter() { return parameter; }
    public void setParameter(String parameter) { this.parameter = parameter; }

    public Double getCurrentValue() { return currentValue; }
    public void setCurrentValue(Double currentValue) { this.currentValue = currentValue; }

    public Double getThresholdLow() { return thresholdLow; }
    public void setThresholdLow(Double thresholdLow) { this.thresholdLow = thresholdLow; }

    public Double getThresholdHigh() { return thresholdHigh; }
    public void setThresholdHigh(Double thresholdHigh) { this.thresholdHigh = thresholdHigh; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getActionTakenBy() { return actionTakenBy; }
    public void setActionTakenBy(String actionTakenBy) { this.actionTakenBy = actionTakenBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
