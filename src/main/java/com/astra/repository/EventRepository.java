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

    // ✅ Your existing method
    default Optional<Event> findLatestPeltierEvent(String boxId) {
        return findTopByBoxIdAndTypeInOrderByTsDesc(
                boxId,
                java.util.List.of("peltier_on", "peltier_off")
        );
    }

    // ✅ Your existing method
    Optional<Event> findTopByBoxIdAndTypeInOrderByTsDesc(String boxId, Collection<String> types);
    // Latest TELEMETRY event for this device
Optional<Event> findTopByBoxIdAndTypeOrderByTsDesc(String boxId, String type);



    // ✅ NEW: Keyset pagination query for /devices/{id}/events endpoint
    @Query(value = """
    SELECT e.* FROM events e
    WHERE e.box_id = :deviceId
      AND (:type IS NULL OR e.type = :type)
      AND (:since IS NULL OR e.ts >= :since)
      AND (:until IS NULL OR e.ts < :until)
      AND (
        :afterTs IS NULL OR
        (e.ts < :afterTs OR (e.ts = :afterTs AND e.id < :afterId))
      )
    ORDER BY e.ts DESC, e.id DESC
    """,
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
