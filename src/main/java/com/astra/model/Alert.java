package com.astra.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "alerts")
public class Alert {

    public enum Status {
        OPEN,
        RESOLVED,
        IGNORED,
        HALTED,
        RECALLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
   @Column(name = "batch_code")
   private String batchCode;

    // maps to alerts.device_id
    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(name = "box_id", nullable = false)
    private String boxId;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    // NEW: maps to alerts.reason (NOT NULL in DB)
    @Column(name = "reason", nullable = false, length = 255)
    private String reason;

    @Column(name = "parameter_name")
    private String parameterName; // "TEMP", "HUMIDITY", "VOC", "TAMPER", etc.

    @Column(name = "current_value")
    private Double currentValue;

    @Column(name = "threshold_low")
    private Double thresholdLow;

    @Column(name = "threshold_high")
    private Double thresholdHigh;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.OPEN;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "action_taken_by")
    private String actionTakenBy;

    // ===== getters & setters =====

    public Long getId() { return id; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public Batch getBatch() { return batch; }
    public void setBatch(Batch batch) { this.batch = batch; }

    public String getBoxId() { return boxId; }
    public void setBoxId(String boxId) { this.boxId = boxId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getParameterName() { return parameterName; }
    public void setParameterName(String parameterName) { this.parameterName = parameterName; }

    public Double getCurrentValue() { return currentValue; }
    public void setCurrentValue(Double currentValue) { this.currentValue = currentValue; }

    public Double getThresholdLow() { return thresholdLow; }
    public void setThresholdLow(Double thresholdLow) { this.thresholdLow = thresholdLow; }

    public Double getThresholdHigh() { return thresholdHigh; }
    public void setThresholdHigh(Double thresholdHigh) { this.thresholdHigh = thresholdHigh; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getActionTakenBy() { return actionTakenBy; }
    public void setActionTakenBy(String actionTakenBy) { this.actionTakenBy = actionTakenBy; }

public String getBatchCode() { 
    return batchCode; 
}

public void setBatchCode(String batchCode) { 
    this.batchCode = batchCode; 
}


}
