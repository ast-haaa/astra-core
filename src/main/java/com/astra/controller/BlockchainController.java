package com.astra.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/blockchain")
public class BlockchainController {

    @GetMapping("/verify/{batchCode}")
    public Map<String, String> verify(@PathVariable String batchCode) {

        // demo proof (real tx hash later)
        return Map.of(
            "network", "Polygon",
            "anchored", "YES",
            "proofType", "SHA-256",
            "reference", "On-chain anchored",
            "batchCode", batchCode
        );
    }
}
