package com.astra.api.dto;

import java.time.Instant;

public class BoxLatestReadingDto {

    private String boxId;
    private String batchCode;

    private Double temperature;
    private Double humidity;

    private Double latitude;
    private Double longitude;

    private String locationName;

    private Instant lastUpdatedAt;
    private boolean hasOpenAlerts;

    private String peltierState;

    public String getBoxId() {
        return boxId;
    }

    public void setBoxId(String boxId) {
        this.boxId = boxId;
    }

    public String getBatchCode() {
        return batchCode;
    }

    public void setBatchCode(String batchCode) {
        this.batchCode = batchCode;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getHumidity() {
        return humidity;
    }

    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public Instant getLastUpdatedAt() {
        return lastUpdatedAt;
    }

    public void setLastUpdatedAt(Instant lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }

    public boolean isHasOpenAlerts() {
        return hasOpenAlerts;
    }

    public void setHasOpenAlerts(boolean hasOpenAlerts) {
        this.hasOpenAlerts = hasOpenAlerts;
    }

    public String getPeltierState() {
        return peltierState;
    }

    public void setPeltierState(String peltierState) {
        this.peltierState = peltierState;
    }
}
