package com.astra.api.dto;

import com.astra.model.Batch;
import lombok.Data;

@Data
public class BatchDto {
    private String batchCode;
    private String herbName;
    private String farmerName;
    private String originLocation;
    private String status;

    public static BatchDto from(Batch b) {
    BatchDto d = new BatchDto();

    d.setBatchCode(b.getBatchCode());
    d.setHerbName(b.getHerbName());

    // SAFE: farmer relation को touch नहीं करेंगे
    d.setFarmerName(b.getFarmerName());

    d.setOriginLocation(b.getOriginLocation());

    if (b.getStatus() != null) {
        d.setStatus(b.getStatus().toString());
    } else {
        d.setStatus(null);
    }

    return d;
}

}
