package com.astra.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "sensor_readings")
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(name = "box_id", nullable = false)
    private String boxId;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp = Instant.now();

    @Column(name = "temperature_c")
    private Double temperatureC;

    @Column(name = "humidity_percent")
    private Double humidityPercent;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "gps_lat")
    private Double gpsLat;

    @Column(name = "gps_lon")
    private Double gpsLon;

    @Column(name = "tamper_flag")
    private Boolean tamperFlag = false;

    // getters & setters

    public Long getId() {
        return id;
    }

    public Batch getBatch() {
        return batch;
    }

    public void setBatch(Batch batch) {
        this.batch = batch;
    }

    public String getBoxId() {
        return boxId;
    }

    public void setBoxId(String boxId) {
        this.boxId = boxId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
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
}
