package com.astra.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "batches")
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Farmer relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private User farmer;

    @Column(name = "batch_code", unique = true, nullable = false)
    private String batchCode;

    @Column(name = "herb_name")
    private String herbName;

    @Column(name = "farmer_name")
    private String farmerName;

    @Column(name = "origin_location")
    private String originLocation;

    @Column(name = "recall_reason")
    private String recallReason;

    @Column(name = "box_id")
    private String boxId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BatchStatus status = BatchStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "lab_result")
    private LabResult labResult = LabResult.NOT_TESTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipment_status")
    private ShipmentStatus shipmentStatus = ShipmentStatus.CREATED;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Batch() {}

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public User getFarmer() { return farmer; }
    public void setFarmer(User farmer) { this.farmer = farmer; }

    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }

    public String getHerbName() { return herbName; }
    public void setHerbName(String herbName) { this.herbName = herbName; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public String getOriginLocation() { return originLocation; }
    public void setOriginLocation(String originLocation) { this.originLocation = originLocation; }

    public String getRecallReason() { return recallReason; }
    public void setRecallReason(String recallReason) { this.recallReason = recallReason; }

    public String getBoxId() { return boxId; }
    public void setBoxId(String boxId) { this.boxId = boxId; }

    public BatchStatus getStatus() { return status; }
    public void setStatus(BatchStatus status) { this.status = status; }

    public LabResult getLabResult() { return labResult; }
    public void setLabResult(LabResult labResult) { this.labResult = labResult; }

    public ShipmentStatus getShipmentStatus() { return shipmentStatus; }
    public void setShipmentStatus(ShipmentStatus shipmentStatus) { this.shipmentStatus = shipmentStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
