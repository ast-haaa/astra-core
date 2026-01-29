package com.astra.api.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

import java.lang.reflect.Method;
import java.time.*;
import java.util.*;

@Data
@AllArgsConstructor
public class JourneyEventDto {
    private String timestampIso;
    private String type;
    private String detail;
    private String meta;

    // -------------------------------
    // CLEAN, READABLE EVENT VERSIONS
    // -------------------------------

    public static JourneyEventDto fromAlert(Object alert) {
    String ts = extractTimestamp(alert);

    String msg =
            extractFirstNonNullString(alert,
                    "getMessage", "getAlertMessage", "getText", "getMsg", "message");

    String status =
            extractFirstNonNullString(alert,
                    "getStatus", "getAlertStatus", "getState");

    if (msg == null || msg.isBlank()) msg = "Alert raised";
    if (status == null || status.isBlank()) status = "OPEN";

    // 🔁 Replace placeholders
    try {
        String boxId = extractFirstNonNullString(alert, "getBoxId", "getDeviceId");
        if (boxId != null && !boxId.isBlank()) {
            msg = msg.replace("{boxId}", boxId);
        }
        msg = msg.replace("{minutes}", "5");
    } catch (Exception ignored) {}

    return new JourneyEventDto(ts, "ALERT", msg, status);
}


    public static JourneyEventDto fromAction(Object action) {
        String ts = extractTimestamp(action);

        String desc =
                extractFirstNonNullString(action,
                        "getDescription", "getDesc", "getNote", "getRemarks", "getActionNote");

        String type =
                extractFirstNonNullString(action,
                        "getActionType", "getType", "getAction");

        if (desc == null || desc.isBlank()) desc = "Corrective action performed";
        if (type == null || type.isBlank()) type = "ACTION";

        return new JourneyEventDto(ts, "ACTION", desc, type);
    }

    public static JourneyEventDto fromLab(Object lab) {
        String ts = extractTimestamp(lab);

        String remarks =
                extractFirstNonNullString(lab,
                        "getRemarks", "getRemark", "getComment", "getNotes");

        String result =
                extractFirstNonNullString(lab,
                        "getResult", "getLabResult", "getStatus");

        if (remarks == null || remarks.isBlank()) remarks = "Lab Test Performed";

        // Normalize result
        if (result != null) {
            result = result.toUpperCase(Locale.ROOT);
            if (result.contains("PASS")) result = "PASS";
            else if (result.contains("FAIL")) result = "FAIL";
        } else {
            result = "UNKNOWN";
        }

        return new JourneyEventDto(ts, "LAB_TEST", remarks, result);
    }

    // -------------------------------
    // UTIL FUNCTIONS (unchanged)
    // -------------------------------

    private static String extractTimestamp(Object obj) {
        if (obj == null) return "";
        List<String> names = Arrays.asList(
                "getCreatedAt", "getCreatedOn", "getTimestamp",
                "getTime", "getCreated"
        );

        for (String n : names) {
            Object v = safeInvoke(obj, n);
            String s = toIsoString(v);
            if (s != null && !s.isEmpty()) return s;
        }

        return toIsoString(obj);
    }

    private static String extractFirstNonNullString(Object obj, String... methodNames) {
        if (obj == null) return "";
        for (String m : methodNames) {
            Object v = safeInvoke(obj, m);
            if (v != null) {
                String s = v.toString();
                if (!s.isBlank()) {
                    return s;
                }
            }
        }
        return "";
    }

    private static Object safeInvoke(Object obj, String methodName) {
        try {
            Method m = obj.getClass().getMethod(methodName);
            return m.invoke(obj);
        } catch (Exception ignored) {
            return null;
        }
    }

    private static String toIsoString(Object dt) {
        if (dt == null) return "";
        try {
            if (dt instanceof Instant) return dt.toString();
            if (dt instanceof OffsetDateTime) return dt.toString();
            if (dt instanceof LocalDateTime) return ((LocalDateTime) dt).atOffset(ZoneOffset.UTC).toString();
            if (dt instanceof Date) return ((Date) dt).toInstant().toString();
            if (dt instanceof String) return (String) dt;
            return dt.toString();
        } catch (Exception e) {
            return dt.toString();
        }
    }
}
