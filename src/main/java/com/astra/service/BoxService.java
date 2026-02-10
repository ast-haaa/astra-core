package com.astra.service;

import com.astra.api.dto.AddBoxRequest;
import com.astra.api.dto.FarmerBoxDto;
import com.astra.model.Box;
import com.astra.model.User;   // ✅ MISSING IMPORT (IMPORTANT)
import com.astra.repository.AlertRepository;
import com.astra.repository.BoxRepository;
import com.astra.repository.DeviceStateRepository;
import com.astra.repository.TelemetrySnapshotRepository;
import com.astra.util.JsonUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BoxService {

    private final BoxRepository boxRepository;
    private final TelemetrySnapshotRepository telemetrySnapshotRepository;
    private final AlertRepository alertRepository;
    private final DeviceStateRepository deviceStateRepository;

    // ---------------- BASIC CRUD ----------------

    public Box save(Box box) {
        return boxRepository.save(box);
    }

    public Optional<Box> findById(String boxId) {
        return boxRepository.findById(boxId);
    }

    public List<Box> findAll() {
        return boxRepository.findAll();
    }

    public void delete(String boxId) {
        boxRepository.deleteById(boxId);
    }

    // ---------------- ADD BOX (FARMER) ----------------

    public Box addBoxForFarmer(Long farmerId, AddBoxRequest request) {

        Box box = new Box();
        box.setBoxId(request.getBoxId());
        box.setName(request.getHerbName());
        box.setLocation(request.getLocation());

        // 🔗 link farmer
        User farmer = new User();
        farmer.setId(farmerId);
        box.setFarmer(farmer);

        return boxRepository.save(box);
    }

    // ---------------- FARMER BOXES ----------------

    public List<FarmerBoxDto> getFarmerBoxes(Long farmerId) {

        List<Box> boxes = boxRepository.findByFarmer_Id(farmerId);

        return boxes.stream().map(box -> {

            FarmerBoxDto dto = new FarmerBoxDto();

            // BASIC INFO
            dto.setBoxId(box.getBoxId());
            dto.setHerbName(box.getName());
            dto.setOrigin(box.getLocation());

            // TELEMETRY SNAPSHOT (payload JSON)
            var snap = telemetrySnapshotRepository
                    .findTopByBoxIdOrderByTimestampDesc(box.getBoxId())
                    .orElse(null);

            if (snap != null && snap.getPayload() != null) {
                try {
                    Map<String, Object> json = JsonUtils.fromJson(snap.getPayload());

                    Double temp = json.containsKey("temperature")
                            ? ((Number) json.get("temperature")).doubleValue()
                            : null;

                    Double hum = json.containsKey("humidity")
                            ? ((Number) json.get("humidity")).doubleValue()
                            : null;

                    dto.setTemperature(temp);
                    dto.setHumidity(hum);

                } catch (Exception ignored) {}
            }

            // ALERT STATUS
            long alertCount = alertRepository.countByBoxId(box.getBoxId());
            dto.setStatus(alertCount > 0 ? "ALERT" : "SAFE");

            // DEVICE STATE → PELTIER STATUS
            var state = deviceStateRepository.findById(box.getBoxId()).orElse(null);

            boolean peltierOn = false;
            if (state != null && state.getPeltier() != null) {
                peltierOn = "ON".equalsIgnoreCase(state.getPeltier());
            }

            dto.setPeltierOn(peltierOn);

            return dto;

        }).toList();
    }
}
