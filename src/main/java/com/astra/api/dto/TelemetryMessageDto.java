package com.astra.api.dto;

public class TelemetryMessageDto {

    private String boxId;
    private String batchCode;

    private Double temperatureC;
    private Double humidityPercent;
    private Double vocPpm;
    private Double weightKg;

    private Double gpsLat;
    private Double gpsLon;

    private Boolean tamperFlag;

    private Long timestampEpochMillis; // optional, can be null -> use server time

    // getters & setters
    private String locationText;
public String getLocationText() { return locationText; }
public void setLocationText(String locationText) { this.locationText = locationText; }


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

    public Double getTemperatureC() {
        return temperatureC;
    }

    public void setTemperatureC(Double temperatureC) {
        this.temperatureC = temperatureC;
    }

    public Double getHumidityPercent() {
        return humidityPercent;
    }

    public void setHumidityPercent(Double humidityPercent) {
        this.humidityPercent = humidityPercent;
    }

    public Double getVocPpm() {
        return vocPpm;
    }

    public void setVocPpm(Double vocPpm) {
        this.vocPpm = vocPpm;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Double getGpsLat() {
        return gpsLat;
    }

    public void setGpsLat(Double gpsLat) {
        this.gpsLat = gpsLat;
    }

    public Double getGpsLon() {
        return gpsLon;
    }

    public void setGpsLon(Double gpsLon) {
        this.gpsLon = gpsLon;
    }

    public Boolean getTamperFlag() {
        return tamperFlag;
    }

    public void setTamperFlag(Boolean tamperFlag) {
        this.tamperFlag = tamperFlag;
    }

    public Long getTimestampEpochMillis() {
        return timestampEpochMillis;
    }

    public void setTimestampEpochMillis(Long timestampEpochMillis) {
        this.timestampEpochMillis = timestampEpochMillis;
    }
}
