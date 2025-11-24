package com.astra.api;

import com.astra.api.dto.CommandRequest;
import com.astra.model.DeviceAction;
import com.astra.repository.DeviceActionRepository;
import com.astra.service.MqttPublisherService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/devices")
public class CommandController {

    private final MqttPublisherService publisher;
    private final DeviceActionRepository actionRepo;
    private final ObjectMapper mapper = new ObjectMapper();

    public CommandController(MqttPublisherService publisher, DeviceActionRepository actionRepo) {
        this.publisher = publisher;
        this.actionRepo = actionRepo;
    }

    @PostMapping("/{deviceId}/commands")
    public ResponseEntity<Map<String, Object>> sendCommand(
            @PathVariable String deviceId,
            @RequestBody CommandRequest req
    ) throws Exception {

        String cmdId = UUID.randomUUID().toString();

        // build payload we’ll send to MQTT
        Map<String,Object> payload = new LinkedHashMap<>();
        payload.put("cmdId", cmdId);
        payload.put("issuedAt", Instant.now().toString());
        if (req.getPeltier() != null) payload.put("peltier", req.getPeltier());
        if (req.getFan() != null)     payload.put("fan", req.getFan());
        if (req.getTargetTemp() != null) payload.put("targetTemp", req.getTargetTemp());

        // publish
        publisher.publishCommand(deviceId, payload);

        // persist to device_actions
        DeviceAction action = new DeviceAction();
        action.setDeviceId(deviceId);
        action.setCmdId(cmdId);
        action.setActionType(resolveActionType(req)); // PELTIER/FAN/MULTI
        action.setPayloadJson(mapper.writeValueAsString(payload));
        action.setResult("PUBLISHED");
        actionRepo.save(action);

        // response to client
        Map<String,Object> resp = new HashMap<>();
        resp.put("deviceId", deviceId);
        resp.put("cmdId", cmdId);
        resp.put("status", "PUBLISHED");
        resp.put("payload", payload);
        return ResponseEntity.ok(resp);
    }

    private String resolveActionType(CommandRequest req) {
        boolean hasP = req.getPeltier()!=null;
        boolean hasF = req.getFan()!=null;
        boolean hasT = req.getTargetTemp()!=null;
        int c = (hasP?1:0) + (hasF?1:0) + (hasT?1:0);
        if (c>1) return "MULTI";
        if (hasP) return "PELTIER";
        if (hasF) return "FAN";
        if (hasT) return "TARGET_TEMP";
        return "UNKNOWN";
    }
}
