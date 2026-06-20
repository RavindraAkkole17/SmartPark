package com.smartpark.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartpark.backend.model.ParkingArea.Location;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingAreaResponse {
    @JsonProperty("_id")
    private String id;
    private String adminId;
    private String name;
    private Location location;
    private String cctvUrl;
    private Double pricePerHour;
    private String image;
    private Instant createdAt;

    private Long totalSlots;
    private Long availableSlots;
    private Long occupiedSlots;
    private Long reservedSlots;
}
