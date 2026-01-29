package com.astra.api.dto;

import lombok.Data;

@Data
public class FarmerProfileRequest {

  private String name;
    private String mobile;
    private String email;
    private String state;
    private String city;
    private String village;
    private String farmName;
    private String langPref;

}
