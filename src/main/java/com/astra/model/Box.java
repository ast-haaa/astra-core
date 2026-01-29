package com.astra.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "boxes")
public class Box {

    @Id
    @Column(name = "box_id", length = 100)
    private String boxId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private User farmer;

    @Column(nullable = true)
    private String name;

    @Column(nullable = true)
    private String owner;

    @Column(nullable = true)
    private String location;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public Box() {
        this.createdAt = Instant.now();
    }

    public Box(String boxId, String name, String owner, String location) {
        this.boxId = boxId;
        this.name = name;
        this.owner = owner;
        this.location = location;
        this.createdAt = Instant.now();
    }

    public String getBoxId() { return boxId; }
    public void setBoxId(String boxId) { this.boxId = boxId; }

    public User getFarmer() { return farmer; }
    public void setFarmer(User farmer) { this.farmer = farmer; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
