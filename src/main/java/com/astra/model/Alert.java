package com.astra.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---- RELATIONS ----
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @Column(name = "box_id")
    private String boxId;

    @Column(name = "device_id")
    private String deviceId;

    // ---- MESSAGE / REASON ----
    @Column(name = "message", length = 2000)
    private String message;

    @Column(name = "reason", length = 2000)
    private String reason;

    // ---- PARAMETERS ----
    @Column(name = "parameter_name")
    private String parameterName;

    @Column(name = "current_value")
    private Double currentValue;

    @Column(name = "threshold_low")
    private Double thresholdLow;

    @Column(name = "threshold_high")
    private Double thresholdHigh;

    // ---- STATUS ----
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.OPEN;

    @Column(name = "action_taken_by")
    private String actionTakenBy;

    // ---- ACTION FIELDS ----
    @Column(name = "action_type")
    private String actionType;

    @Column(name = "action_params", columnDefinition = "TEXT")
    private String actionParams;

    @Column(name = "action_taken_at")
    private LocalDateTime actionTakenAt;

    // ---- ASSIGNMENT ----
    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    // ---- TEMPLATE ----
    @Column(name = "template_code")
    private String templateCode;

    @Column(name = "params", columnDefinition = "TEXT")
    private String params;

    // ---- ESCALATION ----
    @Column(name = "escalated")
    private Boolean escalated = false;

    @Column(name = "escalation_marked_at")
    private LocalDateTime escalationMarkedAt;

    // ---- AUDIT ----
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    // ========= GETTERS & SETTERS ===========
    public Long getId() { return id; }

    public Batch getBatch() { return batch; }
    public void setBatch(Batch batch) { this.batch = batch; }

    public String getBoxId() { return boxId; }
    public void setBoxId(String boxId) { this.boxId = boxId; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

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
    public void setStatus(Status status) { this.status = status; }

    public String getActionTakenBy() { return actionTakenBy; }
    public void setActionTakenBy(String actionTakenBy) { this.actionTakenBy = actionTakenBy; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getActionParams() { return actionParams; }
    public void setActionParams(String actionParams) { this.actionParams = actionParams; }

    public LocalDateTime getActionTakenAt() { return actionTakenAt; }
    public void setActionTakenAt(LocalDateTime actionTakenAt) { this.actionTakenAt = actionTakenAt; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public LocalDateTime getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }

    public Boolean getEscalated() { return escalated; }
    public void setEscalated(Boolean escalated) { this.escalated = escalated; }

    public LocalDateTime getEscalationMarkedAt() { return escalationMarkedAt; }
    public void setEscalationMarkedAt(LocalDateTime escalationMarkedAt) { this.escalationMarkedAt = escalationMarkedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public String getTemplateCode() { return templateCode; }
    public void setTemplateCode(String templateCode) { this.templateCode = templateCode; }

    public String getParams() { return params; }
    public void setParams(String params) { this.params = params; }

    public enum Status {
        OPEN, ACKED, RESOLVED, IGNORED, HALTED, RECALLED, ESCALATED
    }
}
