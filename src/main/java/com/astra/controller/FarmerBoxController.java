package com.astra.controller;

import com.astra.api.dto.BoxDTO;
import com.astra.model.Box;
import com.astra.service.BoxService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/farmer/boxes")
@RequiredArgsConstructor
public class FarmerBoxController {

    private final BoxService boxService;

    // MVP: Farmer ke paas hamesha ye 2 boxes hain
    private static final List<String> FIXED_BOX_IDS = List.of("BOX123", "BOX124");

    // ------------------------------------------------
    // 1) List all farmer boxes (always 2)
    // GET /api/farmer/boxes
    // ------------------------------------------------
    @GetMapping
    public ResponseEntity<List<BoxDTO>> getFarmerBoxes() {
        List<BoxDTO> list = boxService.findAll().stream()
                .filter(b -> FIXED_BOX_IDS.contains(b.getBoxId()))
                .map(this::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    // ------------------------------------------------
    // 2) Get single box details
    // GET /api/farmer/boxes/{boxId}
    // ------------------------------------------------
    @GetMapping("/{boxId}")
    public ResponseEntity<BoxDTO> getBox(@PathVariable String boxId) {
        if (!FIXED_BOX_IDS.contains(boxId)) {
            // MVP: sirf 2 boxes valid
            return ResponseEntity.notFound().build();
        }

        return boxService.findById(boxId)
                .map(b -> ResponseEntity.ok(toDto(b)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ------------------------------------------------
    // Helper: map entity -> DTO
    // ------------------------------------------------
    private BoxDTO toDto(Box b) {
        BoxDTO d = new BoxDTO();
        d.setBoxId(b.getBoxId());
        d.setName(b.getName());
        d.setOwner(b.getOwner());
        d.setLocation(b.getLocation());
        return d;
    }
}
