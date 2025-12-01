package com.astra.api.dto;

import com.astra.model.LabTest;
import com.astra.model.LabResult;

import java.time.LocalDateTime;

public class LabTestDto {
    private Long id;
    private String batchCode;
    private LabResult result;
    private String summary;
    private String reportUrl;
    private String tester;
    private LocalDateTime createdAt;

    public static LabTestDto fromEntity(LabTest e) {
        LabTestDto d = new LabTestDto();
        d.id = e.getId();
        d.batchCode = e.getBatchCode();
        d.result = e.getResult();
        d.summary = e.getSummary();
        d.reportUrl = e.getReportUrl();
        d.tester = e.getTester();
        d.createdAt = e.getCreatedAt();
        return d;
    }

    // getters + setters (generated style)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }
    public LabResult getResult() { return result; }
    public void setResult(LabResult result) { this.result = result; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getReportUrl() { return reportUrl; }
    public void setReportUrl(String reportUrl) { this.reportUrl = reportUrl; }
    public String getTester() { return tester; }
    public void setTester(String tester) { this.tester = tester; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
