package com.astra.api.dto;

import java.time.Instant;

public class TelemetryDTO {
    private Long id;
    private String boxId;
    private Instant timestamp;
    private Double temperature;
    private Double humidity;
    private Double voc;
    private Double weight;

    public TelemetryDTO() { }

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
