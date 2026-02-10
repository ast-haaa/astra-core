package com.astra.controller;

import com.astra.api.dto.LoginResponse;
import com.astra.api.dto.SignupRequest;
import com.astra.api.dto.VerifyOtpRequest;
import com.astra.api.dto.FarmerProfileRequest;
import com.astra.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ----------------------------------------------------------
    // 1) REQUEST OTP (mobile OR email)
    // ----------------------------------------------------------
    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody SignupRequest req) {
        authService.requestOtp(req);
        return ResponseEntity.ok(Map.of("status", "OTP_SENT"));
    }

    // ----------------------------------------------------------
    // 2) VERIFY OTP (mobile OR email)
    // ----------------------------------------------------------
    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(@RequestBody VerifyOtpRequest req) {

        // identifier = mobile OR email
        String identifier = (req.getMobile() != null && !req.getMobile().isBlank())
                ? req.getMobile()
                : req.getEmail();

        LoginResponse resp = authService.verifyOtp(identifier, req.getOtp());

        return ResponseEntity.ok(resp);
    }

    // ----------------------------------------------------------
    // 3) COMPLETE PROFILE (after OTP)
    // ----------------------------------------------------------
    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(@RequestBody FarmerProfileRequest body) {

        authService.completeProfile(
                body.getMobile(),
                body.getName(),
                body.getState(),
                body.getCity(),
                body.getVillage()
        );

        return ResponseEntity.ok(Map.of("status", "PROFILE_UPDATED"));
    }

    // ----------------------------------------------------------
    // 4) REFRESH TOKEN
    // ----------------------------------------------------------
    @GetMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestHeader("Authorization") String oldToken) {
        String newToken = authService.refreshToken(oldToken);
        return ResponseEntity.ok(Map.of("token", newToken));
    }
}
