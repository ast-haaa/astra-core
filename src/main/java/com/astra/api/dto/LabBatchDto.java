package com.astra.api.dto;

import com.astra.model.BatchStatus;
import com.astra.model.LabResult;

public class LabBatchDto {

    private String batchCode;
    private String herbName;
    private BatchStatus status;
    private LabResult labResult;
    private String recallReason;

    public LabBatchDto(String batchCode, String herbName,
                       BatchStatus status, LabResult labResult,
                       String recallReason) {
        this.batchCode = batchCode;
        this.herbName = herbName;
        this.status = status;
        this.labResult = labResult;
        this.recallReason = recallReason;
    }

    public String getBatchCode() {
        return batchCode;
    }

    public String getHerbName() {
        return herbName;
    }

    public BatchStatus getStatus() {
        return status;
    }

    public LabResult getLabResult() {
        return labResult;
    }

    public String getRecallReason() {
        return recallReason;
    }
}
