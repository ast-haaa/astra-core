package com.astra.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "device_thresholds")
public class DeviceThreshold {

    @Id
    @Column(name = "device_id", length = 64)
    private String deviceId;

    @Column(name = "temp_on", nullable = false)
    private Double tempOn;

    @Column(name = "temp_off", nullable = false)
    private Double tempOff;

    @Column(name = "moisture_min", nullable = false)
    private Integer moistureMin;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // getters/setters
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public Double getTempOn() { return tempOn; }
    public void setTempOn(Double tempOn) { this.tempOn = tempOn; }
    public Double getTempOff() { return tempOff; }
    public void setTempOff(Double tempOff) { this.tempOff = tempOff; }
    public Integer getMoistureMin() { return moistureMin; }
    public void setMoistureMin(Integer moistureMin) { this.moistureMin = moistureMin; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}