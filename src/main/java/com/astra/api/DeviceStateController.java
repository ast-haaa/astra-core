package com.astra.api;

import com.astra.api.dto.DeviceStateDto;
import com.astra.service.DeviceStateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/devices")
public class DeviceStateController {

    private final DeviceStateService deviceStateService;

    public DeviceStateController(DeviceStateService deviceStateService) {
        this.deviceStateService = deviceStateService;
    }

    @GetMapping("/{id}/state")
    public ResponseEntity<DeviceStateDto> getState(@PathVariable("id") String deviceId) {
        DeviceStateDto dto = deviceStateService.getLatestState(deviceId);
        return ResponseEntity.ok(dto);
    }
}