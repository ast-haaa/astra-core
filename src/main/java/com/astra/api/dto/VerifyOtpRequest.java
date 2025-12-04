package com.astra.api.dto;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String mobile;   // optional
    private String email;    // optional
    private String otp;      // required
}
