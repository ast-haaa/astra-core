package com.astra.repository;

import com.astra.model.Event;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, String> {
  boolean existsByClientEventId(String clientEventId);

  // FIND BY BATCH — COPY PASTE READY
  List<Event> findByBatch(String batch);

  List<Event> findByBatchOrderByTsDesc(String batch, Pageable pageable);

  List<Event> findByBatchInOrderByTsDesc(Collection<String> batches, Pageable pageable);

  Optional<Event> findTopByBatchOrderByTsDesc(String batch);

  // ALIAS methods if callers use "batchCode"
  default List<Event> findByBatchCode(String batchCode) {
      return findByBatch(batchCode);
  }
  default List<Event> findByBatchCodeOrderByTsDesc(String batchCode, Pageable pageable) {
      return findByBatchOrderByTsDesc(batchCode, pageable);
  }
  default Optional<Event> findTopByBatchCodeOrderByTsDesc(String batchCode) {
      return findTopByBatchOrderByTsDesc(batchCode);
  }

  // KEYSET PAGINATION FOR BATCH — Java8-safe string (if you use Java 15+, you can keep text blocks)
  @Query(value = "SELECT e.* FROM events e " +
    "WHERE e.batch = :batch " +
    "  AND (:type IS NULL OR e.type = :type) " +
    "  AND (:since IS NULL OR e.ts >= :since) " +
    "  AND (:until IS NULL OR e.ts < :until) " +
    "  AND ( " +
    "    :afterTs IS NULL OR " +
    "    (e.ts < :afterTs OR (e.ts = :afterTs AND e.id < :afterId)) " +
    "  ) " +
    "ORDER BY e.ts DESC, e.id DESC",
    nativeQuery = true)
  List<Event> findByBatchKeyset(
          @Param("batch") String batch,
          @Param("type") String type,
          @Param("since") LocalDateTime since,
          @Param("until") LocalDateTime until,
          @Param("afterTs") LocalDateTime afterTs,
          @Param("afterId") String afterId,
          Pageable pageable
  );


  // ✅ Your existing method (Java 8 safe)
  default Optional<Event> findLatestPeltierEvent(String boxId) {
      return findTopByBoxIdAndTypeInOrderByTsDesc(
              boxId,
              Arrays.asList("peltier_on", "peltier_off")
      );
  }

  // ✅ Your existing method
  Optional<Event> findTopByBoxIdAndTypeInOrderByTsDesc(String boxId, Collection<String> types);
  // Latest TELEMETRY event for this device
  Optional<Event> findTopByBoxIdAndTypeOrderByTsDesc(String boxId, String type);


  // ✅ NEW: Keyset pagination query for /devices/{id}/events endpoint
  @Query(value = "SELECT e.* FROM events e " +
    "WHERE e.box_id = :deviceId " +
    "  AND (:type IS NULL OR e.type = :type) " +
    "  AND (:since IS NULL OR e.ts >= :since) " +
    "  AND (:until IS NULL OR e.ts < :until) " +
    "  AND ( " +
    "    :afterTs IS NULL OR " +
    "    (e.ts < :afterTs OR (e.ts = :afterTs AND e.id < :afterId)) " +
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