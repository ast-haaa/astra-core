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

    // factories that accept generic model objects and extract useful fields
    public static JourneyEventDto fromAlert(Object alert) {
        String ts = extractTimestamp(alert);
        String message = extractFirstNonNullString(alert, "getMessage", "getMsg", "getText", "getAlertMessage", "message");
        String status = extractFirstNonNullString(alert, "getStatus", "getState", "getAlertStatus");
        return new JourneyEventDto(ts, "ALERT", message, status);
    }

    public static JourneyEventDto fromAction(Object action) {
        String ts = extractTimestamp(action);
        String desc = extractFirstNonNullString(action, "getDescription", "getDesc", "getNote", "getRemarks", "getActionNote");
        String actionType = extractFirstNonNullString(action, "getActionType", "getType", "getAction");
        return new JourneyEventDto(ts, "ACTION", desc, actionType);
    }

    public static JourneyEventDto fromLab(Object lab) {
        String ts = extractTimestamp(lab);
        String remarks = extractFirstNonNullString(lab, "getRemarks", "getRemark", "getComment", "getNotes");
        String result = extractFirstNonNullString(lab, "getResult", "getLabResult", "getStatus");
        return new JourneyEventDto(ts, "LAB_TEST", remarks, result);
    }

    // ----- helper util methods -----
    private static String extractTimestamp(Object obj) {
        if (obj == null) return "";
        // try common getter names
        List<String> names = Arrays.asList("getCreatedAt", "getCreatedOn", "getTimestamp", "getTime", "getCreated");
        for (String n : names) {
            Object v = safeInvoke(obj, n);
            String s = toIsoString(v);
            if (s != null && !s.isEmpty()) return s;
        }
        // fallback: try field "createdAt" via toString
        return toIsoString(obj);
    }

    private static String extractFirstNonNullString(Object obj, String... methodNames) {
        if (obj == null) return "";
        for (String m : methodNames) {
            Object v = safeInvoke(obj, m);
            if (v != null) {
                String s = v.toString();
                if (!s.isBlank()) return s;
            }
        }
        // fallback to toString of object
        String fallback = obj.toString();
        return fallback == null ? "" : fallback;
    }

    private static Object safeInvoke(Object obj, String methodName) {
        try {
            Method m = obj.getClass().getMethod(methodName);
            return m.invoke(obj);
        } catch (NoSuchMethodException nm) {
            return null;
        } catch (Throwable t) {
            return null;
        }
    }

    private static String toIsoString(Object dt) {
        if (dt == null) return "";
        try {
            if (dt instanceof java.time.Instant) return ((java.time.Instant) dt).toString();
            if (dt instanceof java.time.OffsetDateTime) return ((java.time.OffsetDateTime) dt).toString();
            if (dt instanceof java.time.LocalDateTime) return ((java.time.LocalDateTime) dt).atOffset(ZoneOffset.UTC).toString();
            if (dt instanceof java.util.Date) return ((java.util.Date) dt).toInstant().toString();
            // if dt is already a String that looks like ISO, return it
            if (dt instanceof String) return (String) dt;
            // last fallback: dt.toString()
            return dt.toString();
        } catch (Throwable t) {
            return dt.toString();
        }
    }
}
