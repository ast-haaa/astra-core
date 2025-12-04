package com.astra.api.dto;

import lombok.Data;

@Data
public class FarmerProfileRequest {

    private String mobile;   // mandatory (identify which farmer)

    // profile fields:
    private String name;
    private String state;
    private String city;
    private String village;

}
