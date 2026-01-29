package com.astra.controller;

import com.astra.api.dto.AddBoxRequest;
import com.astra.model.Box;
import com.astra.service.BoxService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/farmer/boxes")
@RequiredArgsConstructor
public class FarmerBoxController {

    private final BoxService boxService;

    @GetMapping
    public ResponseEntity<?> getFarmerBoxes(Authentication auth) {

        // ✅ Null principal safety
        if (auth == null) {
            return ResponseEntity.status(401).build();
        }

        // DEMO farmer
        Long farmerId = 3L;

        return ResponseEntity.ok(
                boxService.getFarmerBoxes(farmerId)
        );
    }

    @PostMapping
    public ResponseEntity<?> addBox(@RequestBody AddBoxRequest request,
                                    Authentication auth) {

        if (auth == null) {
            return ResponseEntity.status(401).build();
        }

        Long farmerId = 3L;

        Box box = boxService.addBoxForFarmer(farmerId, request);

        return ResponseEntity.ok(
                Map.of(
                        "boxId", box.getBoxId(),
                        "status", "BOX_CREATED"
                )
        );
    }
}
