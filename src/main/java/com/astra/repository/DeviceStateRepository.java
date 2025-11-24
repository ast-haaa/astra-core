package com.astra.repository;

import com.astra.model.DeviceState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

public interface DeviceStateRepository extends JpaRepository<DeviceState, String> {

    @Modifying
    @Transactional
    @Query(value = "UPDATE device_state SET last_cmd_id = :cmdId, last_ack_at = NOW() WHERE device_id = :deviceId", nativeQuery = true)
    int updateLastCmdAck(@Param("deviceId") String deviceId, @Param("cmdId") String cmdId);

    @Modifying
    @Transactional
    @Query(value = "UPDATE device_state SET last_location = CAST(:loc AS JSON) WHERE device_id = :deviceId", nativeQuery = true)
    int updateLastLocation(@Param("deviceId") String deviceId, @Param("loc") String loc);
}
