package com.astra.repository;

import com.astra.model.DeviceAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface DeviceActionRepository extends JpaRepository<DeviceAction, Long> {

    Optional<DeviceAction> findByCmdId(String cmdId);

    @Modifying
    @Transactional
    @Query(value = "UPDATE device_actions SET result = :res WHERE cmd_id = :cmdId", nativeQuery = true)
    int updateResultByCmdIdNative(@Param("cmdId") String cmdId, @Param("res") String res);
}
