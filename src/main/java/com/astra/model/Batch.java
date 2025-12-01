package com.astra.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Batch entity – public, complete getters/setters used by controllers/services.
 * Add/remove fields if you already have some in your original class, but keep
 * the method names (getBatchCode, setHerbName, setFarmerName, setOriginLocation, setStatus).
 */
@Entity
@Table(name = "batches")
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_code", unique = true)
    private String batchCode;

    @Column(name = "herb_name")
    private String herbName;

    @Column(name = "farmer_name")
    private String farmerName;

    @Column(name = "origin_location")
    private String originLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BatchStatus status = BatchStatus.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "lab_result")
    private LabResult labResult = LabResult.NOT_TESTED;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Batch() {}

    // --- ID ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    // --- Batch code ---
    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }

    // --- Herb name (used by TelemetryService) ---
    public String getHerbName() { return herbName; }
    public void setHerbName(String herbName) { this.herbName = herbName; }

    // --- Farmer name (used by TelemetryService) ---
    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    // --- Origin location (used by TelemetryService) ---
    public String getOriginLocation() { return originLocation; }
    public void setOriginLocation(String originLocation) { this.originLocation = originLocation; }

    // --- Status ---
    public BatchStatus getStatus() { return status; }
    public void setStatus(BatchStatus status) { this.status = status; }

    // --- Lab result ---
    public LabResult getLabResult() { return labResult; }
    public void setLabResult(LabResult labResult) { this.labResult = labResult; }

    // --- timestamps ---
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
