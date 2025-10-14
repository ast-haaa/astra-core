package com.astra.web;

import com.astra.model.DeviceThreshold;
import com.astra.repository.DeviceThresholdRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/devices")
public class DeviceThresholdController {

    private final DeviceThresholdRepository repo;

    public DeviceThresholdController(DeviceThresholdRepository repo) {
        this.repo = repo;
    }

    // GET /devices/{boxId}/thresholds
    @GetMapping("/{boxId}/thresholds")
    public ResponseEntity<?> getThresholds(@PathVariable String boxId) {
        return repo.findById(boxId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(new ErrorMessage("thresholds_not_found",
                                "No thresholds set for device: " + boxId)));
    }

    // PUT /devices/{boxId}/thresholds
    @PutMapping("/{boxId}/thresholds")
    public ResponseEntity<?> upsertThresholds(@PathVariable String boxId,
                                              @RequestBody ThresholdRequest req) {
        if (req == null) {
            return ResponseEntity.badRequest().body(new ErrorMessage("invalid_body", "Request body is required"));
        }
        if (req.moistureMin == null || req.tempOn == null || req.tempOff == null) {
            return ResponseEntity.badRequest().body(new ErrorMessage("missing_fields",
                    "moistureMin, tempOn, tempOff are required"));
        }

        var entity = repo.findById(boxId).orElseGet(() -> {
            var d = new DeviceThreshold();
            d.setDeviceId(boxId);
            return d;
        });

        entity.setMoistureMin(req.moistureMin);
        entity.setTempOn(req.tempOn);
        entity.setTempOff(req.tempOff);

        repo.save(entity);
        return ResponseEntity.ok(entity);
    }

    // tiny DTOs
    public static class ThresholdRequest {
        public Integer moistureMin;
        public Double tempOn;
        public Double tempOff;
    }
    public static record ErrorMessage(String code, String message) {}
}