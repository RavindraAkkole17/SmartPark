package com.smartpark.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartpark.backend.model.ParkingArea.Location;
import com.smartpark.backend.model.Slot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingAreaDetailResponse {
    @JsonProperty("_id")
    private String id;
    private String adminId;
    private String name;
    private Location location;
    private String cctvUrl;
    private Double pricePerHour;
    private String image;
    private Instant createdAt;

    private List<Slot> slots;
}
