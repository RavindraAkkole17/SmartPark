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
public class BookingResponse {
    @JsonProperty("_id")
    private String id;
    private UserNested userId;
    private ParkingAreaNested parkingAreaId;
    private SlotNested slotId;
    private Instant bookingDate;
    private String paymentId;
    private String orderId;
    private Double amount;
    private String status;
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserNested {
        @JsonProperty("_id")
        private String id;
        private String name;
        private String email;
        private String phone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ParkingAreaNested {
        @JsonProperty("_id")
        private String id;
        private String name;
        private Location location;
        private Double pricePerHour;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SlotNested {
        @JsonProperty("_id")
        private String id;
        private String slotNumber;
        private String status;
    }
}
