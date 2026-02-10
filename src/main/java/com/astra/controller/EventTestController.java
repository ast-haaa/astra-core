package com.astra.controller;

import com.astra.service.EventService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class EventTestController {

    private final EventService eventService;

    public EventTestController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/emit")
    public String emit(@RequestParam String boxId, @RequestParam String type) {
        eventService.emit(
            boxId,
            type,
            Map.of("temp", 33.5, "reason", "manual-test"),
            "auto"
        );
        return "ok";
    }
}
