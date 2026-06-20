package com.smartpark.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {
    private String parkingAreaId;
    private String slotId;
    private String bookingDate;
    private String paymentId;
    private String orderId;
    private Double amount;
}
