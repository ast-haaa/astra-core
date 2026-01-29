package com.astra.service;

import com.astra.api.dto.LabDashboardDto;
import com.astra.model.BatchStatus;
import com.astra.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LabDashboardService {

    private final BatchRepository batchRepository;

    public LabDashboardDto getSummary() {

        LabDashboardDto dto = new LabDashboardDto();

        dto.setTotalBatches(batchRepository.count());
        dto.setPending(batchRepository.countByStatus(BatchStatus.PENDING));
        dto.setApproved(batchRepository.countByStatus(BatchStatus.APPROVED));
        dto.setRejected(batchRepository.countByStatus(BatchStatus.REJECTED));
        dto.setRecalled(batchRepository.countByStatus(BatchStatus.RECALLED));

        return dto;
    }
}
