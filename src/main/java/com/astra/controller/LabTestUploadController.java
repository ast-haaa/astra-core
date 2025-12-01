package com.astra.controller;

import com.astra.model.LabTest;
import com.astra.model.LabResult; // if LabResult enum exists
import com.astra.repository.LabTestRepository;
import com.astra.repository.BatchRepository;
import com.astra.repository.AlertRepository;
import com.astra.model.Alert;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/lab")
@RequiredArgsConstructor
public class LabTestUploadController {

    private final LabTestRepository labTestRepository;
    private final BatchRepository batchRepository;
    private final AlertRepository alertRepository;

    public static class CreateLabTestRequest {
        public String batchCode;
        public String result; // PASS or FAIL (string)
        public String remarks;
        public String performedBy;
    }

    @PostMapping("/tests/upload")
    public ResponseEntity<?> uploadLabTest(@RequestBody CreateLabTestRequest req) {
        if (req == null || req.batchCode == null || req.batchCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "batchCode is required");
        }

        // map to entity (adapt to your LabTest setters)
        LabTest t = new LabTest();
        t.setBatchCode(req.batchCode);
        // if LabResult enum exists, try convert; otherwise save string via setResult(...)
        try {
            // try enum first
            try {
                Class<?> cls = Class.forName("com.astra.model.LabResult");
                Object enumVal = Enum.valueOf((Class<Enum>)cls, req.result.toUpperCase());
                // Attempt to call setter if signature expects LabResult
                try {
                    t.getClass().getMethod("setResult", cls).invoke(t, enumVal);
                } catch (NoSuchMethodException nm) {
                    // fallback to string setter if exists
                    try { t.getClass().getMethod("setResult", String.class).invoke(t, req.result.toUpperCase()); } catch(Exception e){}
                }
            } catch (ClassNotFoundException cnf) {
                // no enum type, call string setter
                try { t.getClass().getMethod("setResult", String.class).invoke(t, req.result==null?"":req.result.toUpperCase()); } catch(Exception e){}
            }
        } catch (Exception ex) {
            // last resort: ignore and continue
        }

        // remarks & performedBy
        try { t.getClass().getMethod("setRemarks", String.class).invoke(t, req.remarks); } catch(Exception e){}
        try { t.getClass().getMethod("setPerformedBy", String.class).invoke(t, req.performedBy==null?"LAB_USER":req.performedBy); } catch(Exception e){}
        // createdAt: check if setter exists for LocalDateTime or Date
        try {
            t.getClass().getMethod("setCreatedAt", java.time.LocalDateTime.class).invoke(t, LocalDateTime.now());
        } catch (NoSuchMethodException nm) {
            try { t.getClass().getMethod("setCreatedAt", java.util.Date.class).invoke(t, java.util.Date.from(LocalDateTime.now().atZone(java.time.ZoneId.systemDefault()).toInstant())); } catch(Exception e){}
        } catch(Exception e){}

        LabTest saved = labTestRepository.save(t);

        // If result = FAIL, create an alert for the batch
        String resultStr = (req.result==null) ? "" : req.result.toUpperCase();
        if ("FAIL".equals(resultStr)) {
            Alert a = new Alert();
            try { a.getClass().getMethod("setBatchCode", String.class).invoke(a, saved.getBatchCode()); } catch(Exception e){}
            try { a.getClass().getMethod("setMessage", String.class).invoke(a, "Lab test FAILED for batch " + saved.getBatchCode()); } catch(Exception e){}
            try { a.getClass().getMethod("setStatus", String.class).invoke(a, "OPEN"); } catch(Exception e){}
            alertRepository.save(a);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("ok", true, "id", saved.getId(), "batchCode", saved.getBatchCode()));
    }
}

