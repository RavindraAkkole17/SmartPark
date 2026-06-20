package com.smartpark.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @JsonProperty("_id")
    private String id;
    private String name;
    private String email;
    private String password;
    private String phone;
    private String role; // "user" or "admin"
    private Instant createdAt = Instant.now();
}
