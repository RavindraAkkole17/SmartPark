package com.smartpark.backend.controller;

import com.smartpark.backend.dto.BookingResponse;
import com.smartpark.backend.dto.CreateBookingRequest;
import com.smartpark.backend.model.Booking;
import com.smartpark.backend.model.ParkingArea;
import com.smartpark.backend.model.Slot;
import com.smartpark.backend.model.User;
import com.smartpark.backend.repository.BookingRepository;
import com.smartpark.backend.repository.ParkingAreaRepository;
import com.smartpark.backend.repository.SlotRepository;
import com.smartpark.backend.repository.UserRepository;
import com.smartpark.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/booking")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private ParkingAreaRepository parkingAreaRepository;

    @Autowired
    private UserRepository userRepository;

    // POST /api/booking
    @PostMapping
    @PreAuthorize("hasRole('user')")
    public ResponseEntity<?> createBooking(@RequestBody CreateBookingRequest request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userPrincipal.getUser();

        // Check if slot exists
        Optional<Slot> slotOpt = slotRepository.findById(request.getSlotId());
        if (slotOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Slot not found"));
        }

        Slot slot = slotOpt.get();
        if ("reserved".equalsIgnoreCase(slot.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Slot is already reserved"));
        }

        // Parse date string (e.g. "2026-06-20") to UTC Instant matching JavaScript new Date()
        Instant bookingInstant;
        try {
            bookingInstant = java.time.LocalDate.parse(request.getBookingDate())
                    .atStartOfDay(java.time.ZoneOffset.UTC)
                    .toInstant();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid booking date format: " + request.getBookingDate()));
        }

        // Check if slot is already booked for the same date
        Optional<Booking> existingBooking = bookingRepository.findFirstBySlotIdAndBookingDateAndStatus(
                request.getSlotId(), bookingInstant, "confirmed"
        );

        if (existingBooking.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Slot is already booked for this date"));
        }

        // Create booking
        Booking booking = Booking.builder()
                .userId(user.getId())
                .parkingAreaId(request.getParkingAreaId())
                .slotId(request.getSlotId())
                .bookingDate(bookingInstant)
                .paymentId(request.getPaymentId() != null ? request.getPaymentId() : "")
                .orderId(request.getOrderId() != null ? request.getOrderId() : "")
                .amount(request.getAmount())
                .status("confirmed")
                .createdAt(Instant.now())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Update slot status to reserved
        slot.setStatus("reserved");
        slot.setCurrentBookingId(savedBooking.getId());
        slot.setUpdatedAt(Instant.now());
        slotRepository.save(slot);

        return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(savedBooking));
    }

    // GET /api/booking/my
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userPrincipal.getUser();
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<BookingResponse> response = new ArrayList<>();
        for (Booking b : bookings) {
            response.add(convertToResponse(b));
        }
        return ResponseEntity.ok(response);
    }

    // GET /api/booking/parking/{parkingId}
    @GetMapping("/parking/{parkingId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> getParkingBookings(@PathVariable String parkingId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User admin = userPrincipal.getUser();

        // Verify admin owns the parking area
        Optional<ParkingArea> areaOpt = parkingAreaRepository.findById(parkingId);
        if (areaOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Parking area not found"));
        }

        ParkingArea area = areaOpt.get();
        if (!area.getAdminId().equals(admin.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Not authorized"));
        }

        List<Booking> bookings = bookingRepository.findByParkingAreaIdOrderByCreatedAtDesc(parkingId);
        List<BookingResponse> response = new ArrayList<>();
        for (Booking b : bookings) {
            response.add(convertToResponse(b));
        }
        return ResponseEntity.ok(response);
    }

    // GET /api/booking/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable String id) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Booking not found"));
        }

        return ResponseEntity.ok(convertToResponse(bookingOpt.get()));
    }

    private BookingResponse convertToResponse(Booking booking) {
        BookingResponse.UserNested userNested = null;
        Optional<User> userOpt = userRepository.findById(booking.getUserId());
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            userNested = BookingResponse.UserNested.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .phone(u.getPhone())
                    .build();
        }

        BookingResponse.ParkingAreaNested areaNested = null;
        Optional<ParkingArea> areaOpt = parkingAreaRepository.findById(booking.getParkingAreaId());
        if (areaOpt.isPresent()) {
            ParkingArea a = areaOpt.get();
            areaNested = BookingResponse.ParkingAreaNested.builder()
                    .id(a.getId())
                    .name(a.getName())
                    .location(a.getLocation())
                    .pricePerHour(a.getPricePerHour())
                    .build();
        }

        BookingResponse.SlotNested slotNested = null;
        Optional<Slot> slotOpt = slotRepository.findById(booking.getSlotId());
        if (slotOpt.isPresent()) {
            Slot s = slotOpt.get();
            slotNested = BookingResponse.SlotNested.builder()
                    .id(s.getId())
                    .slotNumber(s.getSlotNumber())
                    .status(s.getStatus())
                    .build();
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .userId(userNested)
                .parkingAreaId(areaNested)
                .slotId(slotNested)
                .bookingDate(booking.getBookingDate())
                .paymentId(booking.getPaymentId())
                .orderId(booking.getOrderId())
                .amount(booking.getAmount())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
