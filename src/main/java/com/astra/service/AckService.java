package com.astra.service;

import com.astra.model.AckRecord;
import com.astra.model.DeviceState;
import com.astra.repository.AckRepository;
import com.astra.repository.DeviceActionRepository;
import com.astra.repository.DeviceStateRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.time.Instant;


import java.time.LocalDateTime;
import java.util.List;

@Service
public class AckService {
    private final DeviceActionRepository actionRepo;
    private final DeviceStateRepository stateRepo;
    private final AckRepository ackRepo;
    private final ObjectMapper om = new ObjectMapper();

    // constructor now injects AckRepository in addition to existing repos
    public AckService(DeviceActionRepository actionRepo,
                      DeviceStateRepository stateRepo,
                      AckRepository ackRepo) {
        this.actionRepo = actionRepo;
        this.stateRepo = stateRepo;
        this.ackRepo = ackRepo;
    }

    /**
     * Existing MQTT ACK handling logic (keeps earlier behavior).
     * Topic expected like: boxes/<deviceId>/ack
     */
    public void handleAck(String topic, String json) {
        try {
            // basic trace
            System.out.println("ACK IN >>> topic=" + topic + " json=" + json);

            // parse first
            String deviceId = topic.split("/")[1];           // boxes/<id>/ack
            JsonNode node = om.readTree(json);
            String cmdId = node.path("cmdId").asText(null);
            String status = node.path("status").asText("OK");

            System.out.println("ACK FIELDS >>> deviceId=" + deviceId + " cmdId=" + cmdId + " status=" + status);

            // 1) update device_actions.result
            actionRepo.findByCmdId(cmdId).ifPresent(action -> {
                action.setResult("OK".equalsIgnoreCase(status) ? "ACK_OK" : "ACK_ERROR");
                actionRepo.save(action);
                System.out.println("ACK ACTION >>> device_actions updated to " +
                        ("OK".equalsIgnoreCase(status) ? "ACK_OK" : "ACK_ERROR"));
            });

            // 2) upsert device_state
            DeviceState state = stateRepo.findById(deviceId).orElseGet(() -> {
                DeviceState s = new DeviceState();
                s.setDeviceId(deviceId);
                return s;
            });

            JsonNode applied = node.get("applied");
            if (applied != null) {
                if (applied.has("peltier"))    state.setPeltier(applied.get("peltier").asText());
                if (applied.has("fan"))        state.setFan(applied.get("fan").asText());
                if (applied.has("targetTemp")) state.setTargetTemp(applied.get("targetTemp").asDouble());
            }

            var now = LocalDateTime.now();
            state.setUpdatedAt(now);
            // if your entity has these (ours does), set them:
            state.setLastCmdId(cmdId);
            state.setLastAckAt(now);

            stateRepo.save(state);
            System.out.println("ACK STATE  >>> upserting device_state for " + deviceId);

            // 3) persist a lightweight ack record for history / audit (optional but useful)
            try {
                AckRecord r = new AckRecord();
                r.setBoxId(deviceId);
                r.setMessage(node.toString());
                r.setTimestamp(Instant.now());

                ackRepo.save(r);
            } catch (Exception e) {
                // non-fatal: don't break main ACK handling if ack save fails
                System.err.println("Failed to persist ack record: " + e.getMessage());
            }

        } catch (Exception e) {
            System.err.println("ACK handling failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /* ---------- Methods used by controllers ---------- */

    /**
     * Save an AckRecord (used by AckController).
     */
    public AckRecord save(AckRecord ack) {
        return ackRepo.save(ack);
    }

    /**
     * Find ack records for a given boxId, ordered by timestamp desc.
     */
    public List<AckRecord> findByBox(String boxId) {
        return ackRepo.findByBoxIdOrderByTimestampDesc(boxId);
    }
}
