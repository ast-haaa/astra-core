package com.astra.api.dto;

import java.time.Instant;
import java.time.format.DateTimeFormatter;

public class DeviceStateDto {
    private final String deviceId;
    private final Double temp;   // °C
    private final Double rh;     // % RH
    private final Double voc;    // unit as per your payload
    private final String peltier; // "ON" | "OFF" | "UNKNOWN"
    private final String timestamp; // ISO-8601 UTC

    public DeviceStateDto(String deviceId, Double temp, Double rh, Double voc, String peltier, Instant timestampUtc) {
        this.deviceId = deviceId;
        this.temp = temp;
        this.rh = rh;
        this.voc = voc;
        this.peltier = peltier == null ? "UNKNOWN" : peltier;
        // Serialize as ISO-8601 Zulu for frontend
        this.timestamp = timestampUtc == null
                ? null
                : DateTimeFormatter.ISO_INSTANT.format(timestampUtc);
    }

    public String getDeviceId() { return deviceId; }
    public Double getTemp() { return temp; }
    public Double getRh() { return rh; }
    public Double getVoc() { return voc; }
    public String getPeltier() { return peltier; }
    public String getTimestamp() { return timestamp; }
}



