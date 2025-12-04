package com.astra.repository.projection;

import java.time.Instant;

public interface BoxSnapshotSummary {
    String getBoxId();
    Instant getLastTimestamp();
}
