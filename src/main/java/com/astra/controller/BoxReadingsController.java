package com.astra.controller;

import com.astra.api.dto.BoxLatestReadingDto;
import com.astra.service.BoxReadingsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boxes")
public class BoxReadingsController {

    private final BoxReadingsService boxReadingsService;

    public BoxReadingsController(BoxReadingsService boxReadingsService) {
        this.boxReadingsService = boxReadingsService;
    }

    @GetMapping("/latest")
    public List<BoxLatestReadingDto> getLatest() {
        return boxReadingsService.getLatestReadings();
    }
}
