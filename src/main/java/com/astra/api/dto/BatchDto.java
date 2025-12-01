package com.astra.api.dto;

import com.astra.model.Batch;
import lombok.Data;

@Data
public class BatchDto {
    private String batchCode;
    private String herbName;
    private String farmerName;
    private String originLocation;
    private String status; // keep String for DTO / UI convenience

    public static BatchDto from(Batch b) {
        BatchDto d = new BatchDto();
        d.setBatchCode(b.getBatchCode());
        d.setHerbName(b.getHerbName());
        d.setFarmerName(b.getFarmerName());
        d.setOriginLocation(b.getOriginLocation());
        // Convert enum to String safely
        try {
            Object st = b.getStatus();
            d.setStatus(st == null ? null : st.toString()); // handles enum or string
        } catch (Throwable t) {
            d.setStatus(null);
        }
        return d;
    }
}
