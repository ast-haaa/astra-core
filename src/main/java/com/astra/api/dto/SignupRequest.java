package com.astra.api.dto;

import lombok.Data;

@Data
public class SignupRequest {

    private String mobile;     // optional
    private String email;      // optional
    private String langPref;  // en / hi / mr / gu
}
