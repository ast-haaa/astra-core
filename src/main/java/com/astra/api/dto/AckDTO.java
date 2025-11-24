package com.astra.api.dto;

import java.time.Instant;

public class AckDTO {
    private Long id;
    private String boxId;
    private Instant timestamp;
    private String message;

    public AckDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBoxId() { return boxId; }
    public void setBoxId(String boxId) { this.boxId = boxId; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
