package com.astra.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "acks")
public class AckRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "box_id", length = 100, nullable = false)
    private String boxId;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = true, length = 500)
    private String message;

    public AckRecord() {
        this.timestamp = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBoxId() { return boxId; }
    public void setBoxId(String boxId) { this.boxId = boxId; }

    public Instant getTimestamp() { return timestamp; }
public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }


    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
