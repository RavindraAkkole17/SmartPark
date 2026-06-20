package com.smartpark.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    @JsonProperty("_id")
    private String id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String token;
}
