package com.astra.service;

import com.astra.api.dto.LoginResponse;
import com.astra.api.dto.SignupRequest;
import com.astra.model.User;
import com.astra.repository.UserRepository;
import com.astra.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;

    // --------------------------------------------
    // 1) REQUEST OTP (mobile or email)
    // --------------------------------------------
    public void requestOtp(SignupRequest req) {

        // login identifier
        String id = (req.getMobile() != null && !req.getMobile().isBlank())
                ? req.getMobile()
                : req.getEmail();

        if (id == null)
            throw new RuntimeException("Mobile or Email required");

        // existing user
        User user = userRepo.findByMobile(req.getMobile())
                .or(() -> userRepo.findByEmail(req.getEmail()))
                .orElse(new User());

        // ONLY login details update here
        user.setMobile(req.getMobile());
        user.setEmail(req.getEmail());
        user.setLangPref(req.getLangPref() == null ? "en" : req.getLangPref());
        user.setRole("FARMER");

        // onboarding untouched here
        userRepo.save(user);

        otpService.sendOtp(id);
    }

    // --------------------------------------------
    // 2) VERIFY OTP
    // --------------------------------------------
    public LoginResponse verifyOtp(String identifier, String otp) {

        if (!otpService.verify(identifier, otp))
            throw new RuntimeException("Invalid OTP");

        User user = userRepo.findByMobile(identifier)
                .or(() -> userRepo.findByEmail(identifier))
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user);

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getMobile(),
                user.getEmail(),
                user.getRole(),
                user.getLangPref(),
                user.isOnboardingCompleted()
        );
    }

    // --------------------------------------------
    // 3) COMPLETE PROFILE
    // --------------------------------------------
    public void completeProfile(String mobile, String name, String state, String city, String village) {

        User user = userRepo.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(name);
        user.setState(state);
        user.setCity(city);
        user.setVillage(village);
        user.setOnboardingCompleted(true);

        userRepo.save(user);
    }

    // --------------------------------------------
    // 4) REFRESH TOKEN
    // --------------------------------------------
    public String refreshToken(String oldToken) {
        return jwtUtil.refreshToken(oldToken);
    }
}
