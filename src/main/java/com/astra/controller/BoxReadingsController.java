package com.astra.controller;

import com.astra.api.dto.BoxLatestReadingDto;
import com.astra.service.BoxReadingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boxes")
@RequiredArgsConstructor
public class BoxReadingsController {

    private final BoxReadingsService boxReadingsService;

    // ------------------------------------------
    // 1) Latest of ALL boxes
    // ------------------------------------------
    @GetMapping("/latest")
    public List<BoxLatestReadingDto> getLatest() {
        return boxReadingsService.getLatestReadings();
    }

    // ------------------------------------------
    // 2) Latest of ONE box
    // ------------------------------------------
    @GetMapping("/{boxId}/latest")
    public BoxLatestReadingDto getLatestForOne(@PathVariable String boxId) {
        return boxReadingsService.getLatestForBox(boxId);
    }
}
