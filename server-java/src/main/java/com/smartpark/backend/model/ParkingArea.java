package com.smartpark.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "parkingareas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingArea {
    @Id
    @JsonProperty("_id")
    private String id;
    private String adminId; // Stored as String, matches adminId ObjectId
    private String name;
    private Location location;
    private String cctvUrl = "";
    private Integer totalSlots = 0; // Managed by custom counts or field
    private Double pricePerHour = 50.0;
    private String image = "";
    private Instant createdAt = Instant.now();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Location {
        private String address;
        private Double lat;
        private Double lng;
    }
}
