package com.astra.controller;

import com.astra.api.dto.FarmerProfileRequest;
import com.astra.model.User;
import com.astra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lab/profile")
@RequiredArgsConstructor
public class LabTesterProfileController {

    private final UserRepository userRepo;

    // TEMP demo lab tester (jab tak real login nahi hai)
    private static final Long DEMO_LAB_ID = 2L;

    // ---------- 1) Get my profile ----------
    @GetMapping
    public ResponseEntity<User> getMyProfile() {

        User user = userRepo.findById(DEMO_LAB_ID)
                .orElseThrow(() -> new RuntimeException("Lab tester not found"));

        return ResponseEntity.ok(user);
    }

    // ---------- 2) Update my profile ----------
    @PutMapping
    public ResponseEntity<User> updateMyProfile(
            @RequestBody FarmerProfileRequest req
    ) {
        User user = userRepo.findById(DEMO_LAB_ID)
                .orElseThrow(() -> new RuntimeException("Lab tester not found"));

        user.setName(req.getName());
        user.setMobile(req.getMobile());
        user.setEmail(req.getEmail());
        user.setState(req.getState());
        user.setCity(req.getCity());
        user.setVillage(req.getVillage());
        user.setFarmName(req.getFarmName());
        user.setLangPref(req.getLangPref());
        user.setRole("LAB_TESTER");

        return ResponseEntity.ok(userRepo.save(user));
    }
}
