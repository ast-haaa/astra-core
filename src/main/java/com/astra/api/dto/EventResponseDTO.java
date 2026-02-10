package com.astra.api.dto;

import java.time.Instant;
import java.util.Map;

public record EventResponseDTO(
    String id,
    String type,
    Instant ts,
    Map<String, Object> payload,
    String source,
    String severity
) {}
