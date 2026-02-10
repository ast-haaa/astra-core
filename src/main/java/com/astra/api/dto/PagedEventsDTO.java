package com.astra.api.dto;

import java.util.List;

public record PagedEventsDTO(
    String deviceId,
    List<EventResponseDTO> items,
    String nextCursor,
    int count,
    boolean hasMore
) {}
