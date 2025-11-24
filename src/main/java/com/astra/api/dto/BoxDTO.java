package com.astra.api.dto;

public class BoxDTO {
    private String boxId;
    private String name;
    private String owner;
    private String location;

    public BoxDTO() {}

    public String getBoxId() { return boxId; }
    public void setBoxId(String boxId) { this.boxId = boxId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
