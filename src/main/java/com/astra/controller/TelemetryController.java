package com.astra.controller;

import com.astra.api.dto.TelemetryDTO;
import com.astra.model.Telemetry;
import com.astra.service.TelemetryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {
    private final TelemetryService telemetryService;

    public TelemetryController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @PostMapping
    public ResponseEntity<TelemetryDTO> receiveTelemetry(@RequestBody TelemetryDTO dto) {
        if (dto == null || dto.getBoxId() == null || dto.getBoxId().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Telemetry t = new Telemetry();
        t.setBoxId(dto.getBoxId());
        t.setTimestamp(dto.getTimestamp() != null ? dto.getTimestamp() : Instant.now());
        t.setTemperature(dto.getTemperature());
        t.setHumidity(dto.getHumidity());
        t.setVoc(dto.getVoc());
        t.setWeight(dto.getWeight());
        Telemetry saved = telemetryService.save(t);

        TelemetryDTO out = toDto(saved);
        return ResponseEntity.created(URI.create("/api/telemetry/" + saved.getId())).body(out);
    }

    @GetMapping("/box/{boxId}")
    public ResponseEntity<List<TelemetryDTO>> byBox(@PathVariable String boxId) {
        List<Telemetry> list = telemetryService.findByBoxId(boxId);
        List<TelemetryDTO> dtoList = list.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    private TelemetryDTO toDto(Telemetry t) {
        TelemetryDTO d = new TelemetryDTO();
        d.setBoxId(t.getBoxId());
        d.setId(t.getId());
        d.setTimestamp(t.getTimestamp());
        d.setTemperature(t.getTemperature());
        d.setHumidity(t.getHumidity());
        d.setVoc(t.getVoc());
        d.setWeight(t.getWeight());
        return d;
    }
}
