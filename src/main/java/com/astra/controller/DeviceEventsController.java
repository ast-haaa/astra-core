package com.astra.controller;

import com.astra.api.dto.EventResponseDTO;
import com.astra.api.dto.PagedEventsDTO;
import com.astra.api.mapper.EventMapper;
import com.astra.model.Event;
import com.astra.service.EventService;     // ✅ use EventQueryService
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/devices")
public class DeviceEventsController {

    private final EventService eventService;   // ✅ field name updated

    public DeviceEventsController(EventService eventService) {
        this.eventService = eventService;      // ✅ constructor updated
    }

    @GetMapping("/{id}/events")
    public PagedEventsDTO getEvents(
            @PathVariable("id") String deviceId,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "since", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant since,
            @RequestParam(value = "until", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant until,
            @RequestParam(value = "limit", required = false, defaultValue = "50") int limit,
            @RequestParam(value = "after", required = false) String after
    ) {
        if (since != null && until != null && since.isAfter(until)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "`since` must be <= `until`");
        }

        // clamp limit [1, 200]
        limit = Math.max(1, Math.min(limit, 200));

        // parse cursor "tsMillis_uuid"
        Instant afterTs = null;
        UUID afterId = null;
        if (after != null && !after.isBlank()) {
            String[] parts = after.split("_", 2);
            if (parts.length != 2) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Malformed cursor");
            }
            try {
                long epochMs = Long.parseLong(parts[0]);
                afterTs = Instant.ofEpochMilli(epochMs);
                afterId = UUID.fromString(parts[1]);
            } catch (Exception ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Malformed cursor");
            }
        }

        // ✅ now calling the correct service
        List<Event> page = eventService.fetchDeviceEvents(
                deviceId, type, since, until, afterTs, afterId, limit
        );

        // map to DTOs
        List<EventResponseDTO> items = page.stream()
                .map(EventMapper::toDTO)
                .toList();

        // nextCursor logic
        String nextCursor = null;
        boolean hasMore = items.size() == limit;
        if (!page.isEmpty()) {
            Event last = page.get(page.size() - 1);
            long lastMs = last.getTs() == null
                    ? 0
                    : last.getTs().atZone(java.time.ZoneOffset.UTC).toInstant().toEpochMilli();
            nextCursor = lastMs + "_" + last.getId();
        }

        return new PagedEventsDTO(
                deviceId,
                items,
                nextCursor,
                items.size(),
                hasMore
        );
    }
}
