package com.astra.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "device_state")
public class DeviceState {

    @Id
    @Column(name = "device_id", nullable = false, length = 64)
    private String deviceId;
    
    @Column(name = "peltier_status")
private String peltierStatus;

public String getPeltierStatus() { return peltierStatus; }
public void setPeltierStatus(String s) { this.peltierStatus = s; }

@Column(name = "last_location", columnDefinition = "JSON")
private String lastLocation;

public String getLastLocation() { return lastLocation; }
public void setLastLocation(String lastLocation) { this.lastLocation = lastLocation; }

    @Column(name = "peltier", length = 8)
    private String peltier;          // "ON" | "OFF"

    @Column(name = "fan", length = 8)
    private String fan;              // "ON" | "OFF" | "AUTO"

    @Column(name = "target_temp")
    private Double targetTemp;       // °C

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // last state update we applied

    // optional metadata we added in SQL step (safe if columns appear later)
    @Column(name = "last_ack_at")
    private LocalDateTime lastAckAt;

    @Column(name = "last_cmd_id", length = 64)
    private String lastCmdId;

    // getters/setters
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public String getPeltier() { return peltier; }
    public void setPeltier(String peltier) { this.peltier = peltier; }
    public String getFan() { return fan; }
    public void setFan(String fan) { this.fan = fan; }
    public Double getTargetTemp() { return targetTemp; }
    public void setTargetTemp(Double targetTemp) { this.targetTemp = targetTemp; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getLastAckAt() { return lastAckAt; }
    public void setLastAckAt(LocalDateTime lastAckAt) { this.lastAckAt = lastAckAt; }
    public String getLastCmdId() { return lastCmdId; }
    public void setLastCmdId(String lastCmdId) { this.lastCmdId = lastCmdId; }
}
