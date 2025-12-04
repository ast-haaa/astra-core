package com.astra.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.Map;

public class JsonUtils {

    private static final ObjectMapper mapper = new ObjectMapper();

    /**
     * Convert Java object → JSON string
     */
    public static String toJson(Object obj) {
        try {
            if (obj == null) return "{}";
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("JSON write failed", e);
        }
    }

    /**
     * Convert JSON string → Map<String, Object>
     */
    public static Map<String, Object> fromJson(String json) {
        try {
            if (json == null || json.isBlank()) {
                return Collections.emptyMap();
            }
            return mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException("JSON read failed", e);
        }
    }
}
