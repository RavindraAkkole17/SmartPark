package com.smartpark.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slot {
    @Id
    @JsonProperty("_id")
    private String id;
    private String parkingAreaId;
    private String slotNumber;
    private List<Coordinate> coordinates;
    private String status = "empty"; // 'empty', 'occupied', 'reserved'
    private String currentBookingId = null;
    private Instant updatedAt = Instant.now();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Coordinate {
        private Double x;
        private Double y;
    }
}
