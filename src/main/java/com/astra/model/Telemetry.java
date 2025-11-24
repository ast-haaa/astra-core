package com.astra.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "telemetry")
public class Telemetry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "box_id", length = 100, nullable = false)
    private String boxId;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = true)
    private Double temperature;

    @Column(nullable = true)
    private Double humidity;

    @Column(nullable = true)
    private Double voc;

    @Column(nullable = true)
    private Double weight;

    public Telemetry() {
        this.timestamp = Instant.now();
    }

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBoxId() { return boxId; }
    public void setBoxId(String boxId) { this.boxId = boxId; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }

    public Double getVoc() { return voc; }
    public void setVoc(Double voc) { this.voc = voc; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
}
