package com.astra.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "telemetry_snapshots")
public class TelemetrySnapshot {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "box_id")
    private String boxId;

    @Column(name = "batch_id", length = 36)
    private String batchId;

    private Instant timestamp;

    @Column(columnDefinition = "JSON")
    private String payload;

    // getters / setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBoxId() { return boxId; }
    public void setBoxId(String boxId) { this.boxId = boxId; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
}
