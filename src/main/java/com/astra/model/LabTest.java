package com.astra.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_tests")
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_code", nullable = false)
    private String batchCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "result")
    private LabResult result = LabResult.NOT_TESTED;

    @Column(name = "summary", length = 2000)
    private String summary;

    @Column(name = "report_url")
    private String reportUrl; // for demo: simple string link

    @Column(name = "tester")
    private String tester;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // getters + setters
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
