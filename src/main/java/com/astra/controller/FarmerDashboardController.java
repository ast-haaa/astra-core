package com.astra.controller;

import com.astra.api.dto.FarmerDashboardDto;
import com.astra.model.BatchStatus;
import com.astra.repository.BatchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer/dashboard")
public class FarmerDashboardController {

    private final BatchRepository batchRepository;

    // TEMP farmer id
    private static final Long DEMO_FARMER_ID = 1L;

    public FarmerDashboardController(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    @GetMapping
    public ResponseEntity<FarmerDashboardDto> getDashboard() {

        long total = batchRepository.findByFarmerId(DEMO_FARMER_ID).size();
        long pending = batchRepository.countByFarmerIdAndStatus(DEMO_FARMER_ID, BatchStatus.PENDING);
        long approved = batchRepository.countByFarmerIdAndStatus(DEMO_FARMER_ID, BatchStatus.APPROVED);
        long rejected = batchRepository.countByFarmerIdAndStatus(DEMO_FARMER_ID, BatchStatus.REJECTED);
        long recalled = batchRepository.countByFarmerIdAndStatus(DEMO_FARMER_ID, BatchStatus.RECALLED);

        FarmerDashboardDto dto = new FarmerDashboardDto(
                total, pending, approved, rejected, recalled
        );

        return ResponseEntity.ok(dto);
    }
}
