package com.astra.api.dto;

import com.astra.model.BatchStatus;
import com.astra.model.LabResult;

import java.util.List;

public class LabBatchDetailDto {

    private String batchCode;
    private String herbName;
    private BatchStatus status;
    private LabResult labResult;
    private String recallReason;
    private List<LabTestDto> tests;

    public LabBatchDetailDto(String batchCode, String herbName,
                             BatchStatus status, LabResult labResult,
                             String recallReason,
                             List<LabTestDto> tests) {
        this.batchCode = batchCode;
        this.herbName = herbName;
        this.status = status;
        this.labResult = labResult;
        this.recallReason = recallReason;
        this.tests = tests;
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

    public List<LabTestDto> getTests() {
        return tests;
    }
}
