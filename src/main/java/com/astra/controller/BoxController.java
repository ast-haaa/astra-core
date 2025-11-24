package com.astra.controller;

import com.astra.api.dto.BoxDTO;
import com.astra.model.Box;
import com.astra.service.BoxService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/boxes")
public class BoxController {
    private final BoxService boxService;

    public BoxController(BoxService boxService) {
        this.boxService = boxService;
    }

    @PostMapping
    public ResponseEntity<BoxDTO> create(@RequestBody BoxDTO dto) {
        if (dto.getBoxId() == null || dto.getBoxId().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Box b = new Box(dto.getBoxId(), dto.getName(), dto.getOwner(), dto.getLocation());
        Box saved = boxService.save(b);
        return ResponseEntity.created(URI.create("/api/boxes/" + saved.getBoxId())).body(toDto(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoxDTO> get(@PathVariable("id") String id) {
        return boxService.findById(id).map(b -> ResponseEntity.ok(toDto(b))).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<BoxDTO>> list() {
        List<BoxDTO> list = boxService.findAll().stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoxDTO> update(@PathVariable("id") String id, @RequestBody BoxDTO dto) {
        return boxService.findById(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setOwner(dto.getOwner());
            existing.setLocation(dto.getLocation());
            Box saved = boxService.save(existing);
            return ResponseEntity.ok(toDto(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        boxService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private BoxDTO toDto(Box b) {
        BoxDTO d = new BoxDTO();
        d.setBoxId(b.getBoxId());
        d.setName(b.getName());
        d.setOwner(b.getOwner());
        d.setLocation(b.getLocation());
        return d;
    }
}
