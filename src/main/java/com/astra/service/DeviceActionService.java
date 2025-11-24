package com.astra.service;

import com.astra.model.DeviceAction;
import com.astra.repository.DeviceActionRepository;
import com.astra.repository.DeviceStateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class DeviceActionService {

    private final DeviceActionRepository deviceActionRepository;
    private final DeviceStateRepository deviceStateRepository;

    public DeviceActionService(DeviceActionRepository deviceActionRepository,
                               DeviceStateRepository deviceStateRepository) {
        this.deviceActionRepository = deviceActionRepository;
        this.deviceStateRepository = deviceStateRepository;
    }

    /**
     * Mark a command as ACKed (or ACK_ERROR) and record last_cmd_id + last_ack_at on device_state.
     * Returns true if update succeeded (at least 1 row affected on action).
     */
    @Transactional
    public boolean acknowledgeCommand(String cmdId, String result) {
        // 1) update action result
        int updated = deviceActionRepository.updateResultByCmdIdNative(cmdId, result);
        if (updated == 0) {
            // no action row found for cmdId
            return false;
        }

        // 2) fetch device_id for this cmd so we can update device_state
        Optional<DeviceAction> opt = deviceActionRepository.findByCmdId(cmdId);
        if (opt.isPresent()) {
            String deviceId = opt.get().getDeviceId();
            deviceStateRepository.updateLastCmdAck(deviceId, cmdId);
        }
        return true;
    }
}
