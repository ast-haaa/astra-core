package com.astra.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private String name;
    private String mobile;
    private String email;
    private String role;
    private String langPref;
    private boolean onboardingCompleted;
}
