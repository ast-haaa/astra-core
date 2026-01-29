package com.astra.service;

import com.astra.api.dto.FarmerDashboardDto;
import com.astra.model.BatchStatus;
import com.astra.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FarmerDashboardService {

    private final BatchRepository batchRepository;

    // TEMP demo farmer id
    private static final Long DEMO_FARMER_ID = 1L;

    public FarmerDashboardDto getSummary() {

        FarmerDashboardDto dto = new FarmerDashboardDto();

        dto.setTotalBatches(batchRepository.findByFarmerId(DEMO_FARMER_ID).size());
        dto.setPending(batchRepository.countByFarmerIdAndStatus(DEMO_FARMER_ID, BatchStatus.PENDING));
        dto.setApproved(batchRepository.countByFarmerIdAndStatus(DEMO_FARMER_ID, BatchStatus.APPROVED));
        dto.setRejected(batchRepository.countByFarmerIdAndStatus(DEMO_FARMER_ID, BatchStatus.REJECTED));
        dto.setRecalled(batchRepository.countByFarmerIdAndStatus(DEMO_FARMER_ID, BatchStatus.RECALLED));

        return dto;
    }
}
