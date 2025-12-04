package com.astra.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @Column(name = "id")
    private String id;   // UUID string

    @Column(name = "box_id", nullable = false)
    private String boxId;

    @Column(name = "batch_code")
    private String batchCode;

    @Column(name = "client_event_id")
    private String clientEventId;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "payload_json", columnDefinition = "text")
    private String payloadJson;

    @Column(name = "actor")
    private String actor;

    @Column(name = "ts", nullable = false)
    private LocalDateTime ts;

    // ===== GETTERS & SETTERS =====

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBoxId() { return boxId; }
    public void setBoxId(String boxId) { this.boxId = boxId; }

    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }

    public String getClientEventId() { return clientEventId; }
    public void setClientEventId(String clientEventId) { this.clientEventId = clientEventId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }

    public LocalDateTime getTs() { return ts; }
    public void setTs(LocalDateTime ts) { this.ts = ts; }
}
