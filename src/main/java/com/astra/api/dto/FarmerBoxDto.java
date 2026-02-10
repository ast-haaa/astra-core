package com.astra.api.dto;

import lombok.Data;

@Data
public class FarmerBoxDto {

    private String boxId;
    private String herbName;
    private Double temperature;
    private Double humidity;
    private String status;
    private boolean peltierOn;
    private String origin;
}
