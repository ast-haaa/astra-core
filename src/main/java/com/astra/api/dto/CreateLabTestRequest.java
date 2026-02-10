package com.astra.api.dto;

import com.astra.model.LabResult;

public class CreateLabTestRequest {
    private String batchCode;
    private LabResult result;
    private String summary;
    private String reportUrl;
    private String tester;

    // getters + setters
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
}
