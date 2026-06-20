package com.smartpark.backend.repository;

import com.smartpark.backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Booking> findByParkingAreaIdOrderByCreatedAtDesc(String parkingAreaId);
    Optional<Booking> findFirstBySlotIdAndBookingDateAndStatus(String slotId, Instant bookingDate, String status);
}
