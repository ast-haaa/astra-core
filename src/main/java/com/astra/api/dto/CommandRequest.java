package com.astra.api.dto;

public class CommandRequest {
    private String peltier;   // "ON" | "OFF" | null
    private String fan;       // "ON" | "OFF" | "AUTO" | null
    private Double targetTemp;// optional

    public String getPeltier() { return peltier; }
    public void setPeltier(String peltier) { this.peltier = peltier; }
    public String getFan() { return fan; }
    public void setFan(String fan) { this.fan = fan; }
    public Double getTargetTemp() { return targetTemp; }
    public void setTargetTemp(Double targetTemp) { this.targetTemp = targetTemp; }
}
