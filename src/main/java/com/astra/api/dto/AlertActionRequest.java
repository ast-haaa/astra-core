package com.astra.api.dto;

public class AlertActionRequest {

    private String action; // RESOLVE, IGNORE, HALT, RECALL
    private String actor;  // "farmer", "transporter", "system", etc.

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getActor() {
        return actor;
    }

    public void setActor(String actor) {
        this.actor = actor;
    }
}
