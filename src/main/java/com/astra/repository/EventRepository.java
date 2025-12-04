package com.astra.repository;

import com.astra.model.Event;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, String> {

    // --- BASIC LOOKUPS ---
    boolean existsByClientEventId(String clientEventId);

    List<Event> findByBatchCode(String batchCode);

    List<Event> findByBatchCodeOrderByTsDesc(String batchCode, Pageable pageable);

    List<Event> findByBatchCodeInOrderByTsDesc(Collection<String> batchCodes, Pageable pageable);

    Optional<Event> findTopByBatchCodeOrderByTsDesc(String batchCode);

    // --- PELTIER EVENTS ---
    Optional<Event> findTopByBoxIdAndTypeInOrderByTsDesc(String boxId, Collection<String> types);

    Optional<Event> findTopByBoxIdAndTypeOrderByTsDesc(String boxId, String type);

    // 👉 Required by DeviceStateService – THIS FIXES YOUR ERROR
    default Optional<Event> findLatestPeltierEvent(String boxId) {
        return findTopByBoxIdAndTypeInOrderByTsDesc(
                boxId,
                List.of("peltier_on", "peltier_off")
        );
    }

    // --- KEYSET PAGINATION FOR BATCH ---
    @Query(value =
            "SELECT e.* FROM events e " +
            "WHERE e.batch_code = :batchCode " +
            "  AND (:type IS NULL OR e.type = :type) " +
            "  AND (:since IS NULL OR e.ts >= :since) " +
            "  AND (:until IS NULL OR e.ts < :until) " +
            "  AND ( " +
            "       :afterTs IS NULL OR " +
            "       (e.ts < :afterTs OR (e.ts = :afterTs AND e.id < :afterId)) " +
            "  ) " +
            "ORDER BY e.ts DESC, e.id DESC",
            nativeQuery = true)
    List<Event> findByBatchKeyset(
            @Param("batchCode") String batchCode,
            @Param("type") String type,
            @Param("since") LocalDateTime since,
            @Param("until") LocalDateTime until,
            @Param("afterTs") LocalDateTime afterTs,
            @Param("afterId") String afterId,
            Pageable pageable
    );

    // --- DEVICE EVENTS KEYSET ---
    @Query(value =
            "SELECT e.* FROM events e " +
            "WHERE e.box_id = :deviceId " +
            "  AND (:type IS NULL OR e.type = :type) " +
            "  AND (:since IS NULL OR e.ts >= :since) " +
            "  AND (:until IS NULL OR e.ts < :until) " +
            "  AND ( " +
            "       :afterTs IS NULL OR " +
            "       (e.ts < :afterTs OR (e.ts = :afterTs AND e.id < :afterId)) " +
            "  ) " +
            "ORDER BY e.ts DESC, e.id DESC",
            nativeQuery = true)
    List<Event> findDeviceEvents(
            @Param("deviceId") String deviceId,
            @Param("type") String type,
            @Param("since") LocalDateTime since,
            @Param("until") LocalDateTime until,
            @Param("afterTs") LocalDateTime afterTs,
            @Param("afterId") String afterId,
            Pageable pageable
    );
}
