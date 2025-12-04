package com.astra.controller;

import com.astra.model.User;
import com.astra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer")
@RequiredArgsConstructor
public class FarmerProfileController {

    private final UserRepository userRepo;

    // TEMP: fixed demo farmer
    private static final Long DEMO_FARMER_ID = 1L;

    // ---------- 1) Get my profile ----------
    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile() {

        // Agar user nahi mila to auto create kar de
        User user = userRepo.findById(DEMO_FARMER_ID).orElseGet(() -> {
            User u = new User();
            u.setId(DEMO_FARMER_ID);
            u.setName("Demo Farmer");
            u.setLangPref("en");
            return userRepo.save(u);
        });

        return ResponseEntity.ok(user);
    }

    // ---------- 2) Update my profile ----------
    @PutMapping("/me")
    public ResponseEntity<User> updateMyProfile(@RequestBody User req) {

        User user = userRepo.findById(DEMO_FARMER_ID).orElseGet(User::new);

        user.setId(DEMO_FARMER_ID);
        user.setName(req.getName());
        user.setMobile(req.getMobile());
        user.setEmail(req.getEmail());
        user.setState(req.getState());
        user.setCity(req.getCity());
        user.setVillage(req.getVillage());
        user.setFarmName(req.getFarmName());
        user.setLangPref(req.getLangPref());

        User saved = userRepo.save(user);
        return ResponseEntity.ok(saved);
    }
}
