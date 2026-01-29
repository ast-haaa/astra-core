package com.astra.api.dto;

import lombok.Data;

@Data
public class AddBoxRequest {
    private String boxId;
    private String herbName;
    private String location;
}
