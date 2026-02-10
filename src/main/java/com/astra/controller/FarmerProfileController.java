package com.astra.controller;

import com.astra.api.dto.FarmerProfileRequest;
import com.astra.model.User;
import com.astra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer/profile")
@RequiredArgsConstructor
public class FarmerProfileController {

    private final UserRepository userRepo;

    // TEMP demo farmer (jab tak real login nahi hai)
    private static final Long DEMO_FARMER_ID = 1L;

    // ---------- 1) Get my profile ----------
    @GetMapping
    public ResponseEntity<User> getMyProfile() {

        User user = userRepo.findById(DEMO_FARMER_ID)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        return ResponseEntity.ok(user);
    }

    // ---------- 2) Update my profile ----------
    @PutMapping
    public ResponseEntity<User> updateMyProfile(
            @RequestBody FarmerProfileRequest req
    ) {
        User user = userRepo.findById(DEMO_FARMER_ID)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        user.setName(req.getName());
        user.setMobile(req.getMobile());
        user.setEmail(req.getEmail());
        user.setState(req.getState());
        user.setCity(req.getCity());
        user.setVillage(req.getVillage());
        user.setFarmName(req.getFarmName());
        user.setLangPref(req.getLangPref());

        return ResponseEntity.ok(userRepo.save(user));
    }
}
