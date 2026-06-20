package com.smartpark.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @JsonProperty("_id")
    private String id;
    private String userId;
    private String parkingAreaId;
    private String slotId;
    private Instant bookingDate;
    private String paymentId = "";
    private String orderId = "";
    private Double amount;
    private String status = "confirmed"; // 'confirmed', 'completed', 'cancelled'
    private Instant createdAt = Instant.now();
}
