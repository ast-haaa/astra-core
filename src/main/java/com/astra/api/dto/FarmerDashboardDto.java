package com.astra.api.dto;

public class FarmerDashboardDto {

    private long totalBatches;
    private long pending;
    private long approved;
    private long rejected;
    private long recalled;

    public FarmerDashboardDto() {}   // FIX

    public FarmerDashboardDto(long totalBatches, long pending, long approved, long rejected, long recalled) {
        this.totalBatches = totalBatches;
        this.pending = pending;
        this.approved = approved;
        this.rejected = rejected;
        this.recalled = recalled;
    }

    public long getTotalBatches() { return totalBatches; }
    public void setTotalBatches(long totalBatches) { this.totalBatches = totalBatches; }

    public long getPending() { return pending; }
    public void setPending(long pending) { this.pending = pending; }

    public long getApproved() { return approved; }
    public void setApproved(long approved) { this.approved = approved; }

    public long getRejected() { return rejected; }
    public void setRejected(long rejected) { this.rejected = rejected; }

    public long getRecalled() { return recalled; }
    public void setRecalled(long recalled) { this.recalled = recalled; }
}