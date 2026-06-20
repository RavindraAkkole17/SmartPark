package com.smartpark.backend.controller;

import com.smartpark.backend.dto.ParkingAreaDetailResponse;
import com.smartpark.backend.dto.ParkingAreaResponse;
import com.smartpark.backend.model.Booking;
import com.smartpark.backend.model.ParkingArea;
import com.smartpark.backend.model.Slot;
import com.smartpark.backend.model.User;
import com.smartpark.backend.repository.BookingRepository;
import com.smartpark.backend.repository.ParkingAreaRepository;
import com.smartpark.backend.repository.SlotRepository;
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
@RequestMapping("/api/parking")
public class ParkingController {

    @Autowired
    private ParkingAreaRepository parkingAreaRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // POST /api/parking
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> createParkingArea(@RequestBody ParkingArea request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User admin = userPrincipal.getUser();
        ParkingArea area = ParkingArea.builder()
                .adminId(admin.getId())
                .name(request.getName())
                .location(request.getLocation())
                .cctvUrl(request.getCctvUrl() != null ? request.getCctvUrl() : "")
                .pricePerHour(request.getPricePerHour() != null ? request.getPricePerHour() : 50.0)
                .image(request.getImage() != null ? request.getImage() : "")
                .totalSlots(0)
                .build();

        ParkingArea saved = parkingAreaRepository.save(area);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // GET /api/parking
    @GetMapping
    public ResponseEntity<?> getAllParkingAreas() {
        List<ParkingArea> areas = parkingAreaRepository.findAll();
        List<ParkingAreaResponse> response = new ArrayList<>();

        for (ParkingArea area : areas) {
            long total = slotRepository.countByParkingAreaId(area.getId());
            long available = slotRepository.countByParkingAreaIdAndStatus(area.getId(), "empty");
            long occupied = slotRepository.countByParkingAreaIdAndStatus(area.getId(), "occupied");
            long reserved = slotRepository.countByParkingAreaIdAndStatus(area.getId(), "reserved");

            response.add(ParkingAreaResponse.builder()
                    .id(area.getId())
                    .adminId(area.getAdminId())
                    .name(area.getName())
                    .location(area.getLocation())
                    .cctvUrl(area.getCctvUrl())
                    .pricePerHour(area.getPricePerHour())
                    .image(area.getImage())
                    .createdAt(area.getCreatedAt())
                    .totalSlots(total)
                    .availableSlots(available)
                    .occupiedSlots(occupied)
                    .reservedSlots(reserved)
                    .build());
        }
        return ResponseEntity.ok(response);
    }

    // GET /api/parking/my
    @GetMapping("/my")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> getMyAdminParkingAreas(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User admin = userPrincipal.getUser();
        List<ParkingArea> areas = parkingAreaRepository.findByAdminId(admin.getId());
        List<ParkingAreaResponse> response = new ArrayList<>();

        for (ParkingArea area : areas) {
            long total = slotRepository.countByParkingAreaId(area.getId());
            long available = slotRepository.countByParkingAreaIdAndStatus(area.getId(), "empty");
            long occupied = slotRepository.countByParkingAreaIdAndStatus(area.getId(), "occupied");
            long reserved = slotRepository.countByParkingAreaIdAndStatus(area.getId(), "reserved");

            response.add(ParkingAreaResponse.builder()
                    .id(area.getId())
                    .adminId(area.getAdminId())
                    .name(area.getName())
                    .location(area.getLocation())
                    .cctvUrl(area.getCctvUrl())
                    .pricePerHour(area.getPricePerHour())
                    .image(area.getImage())
                    .createdAt(area.getCreatedAt())
                    .totalSlots(total)
                    .availableSlots(available)
                    .occupiedSlots(occupied)
                    .reservedSlots(reserved)
                    .build());
        }
        return ResponseEntity.ok(response);
    }

    // GET /api/parking/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getParkingAreaById(@PathVariable String id) {
        Optional<ParkingArea> areaOpt = parkingAreaRepository.findById(id);
        if (areaOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Parking area not found"));
        }

        ParkingArea area = areaOpt.get();
        List<Slot> slots = slotRepository.findByParkingAreaId(id);

        ParkingAreaDetailResponse response = ParkingAreaDetailResponse.builder()
                .id(area.getId())
                .adminId(area.getAdminId())
                .name(area.getName())
                .location(area.getLocation())
                .cctvUrl(area.getCctvUrl())
                .pricePerHour(area.getPricePerHour())
                .image(area.getImage())
                .createdAt(area.getCreatedAt())
                .slots(slots)
                .build();

        return ResponseEntity.ok(response);
    }

    // PUT /api/parking/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> updateParkingArea(@PathVariable String id, @RequestBody ParkingArea request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Optional<ParkingArea> areaOpt = parkingAreaRepository.findById(id);
        if (areaOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Parking area not found"));
        }

        ParkingArea area = areaOpt.get();
        User admin = userPrincipal.getUser();

        if (!area.getAdminId().equals(admin.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Not authorized to update this parking area"));
        }

        if (request.getName() != null) area.setName(request.getName());
        if (request.getLocation() != null) area.setLocation(request.getLocation());
        if (request.getCctvUrl() != null) area.setCctvUrl(request.getCctvUrl());
        if (request.getPricePerHour() != null) area.setPricePerHour(request.getPricePerHour());
        if (request.getImage() != null) area.setImage(request.getImage());

        ParkingArea updated = parkingAreaRepository.save(area);
        return ResponseEntity.ok(updated);
    }

    // POST /api/parking/{id}/slots
    @PostMapping("/{id}/slots")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> addOrUpdateSlots(@PathVariable String id, @RequestBody Map<String, List<Slot>> request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Optional<ParkingArea> areaOpt = parkingAreaRepository.findById(id);
        if (areaOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Parking area not found"));
        }

        ParkingArea area = areaOpt.get();
        User admin = userPrincipal.getUser();

        if (!area.getAdminId().equals(admin.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Not authorized"));
        }

        List<Slot> inputSlots = request.get("slots");
        List<Slot> savedSlots = new ArrayList<>();

        if (inputSlots != null) {
            for (Slot s : inputSlots) {
                Optional<Slot> existingSlotOpt = slotRepository.findByParkingAreaIdAndSlotNumber(id, s.getSlotNumber());
                if (existingSlotOpt.isPresent()) {
                    Slot existing = existingSlotOpt.get();
                    existing.setCoordinates(s.getCoordinates());
                    existing.setUpdatedAt(Instant.now());
                    savedSlots.add(slotRepository.save(existing));
                } else {
                    Slot newSlot = Slot.builder()
                            .parkingAreaId(id)
                            .slotNumber(s.getSlotNumber())
                            .coordinates(s.getCoordinates())
                            .status("empty")
                            .currentBookingId(null)
                            .updatedAt(Instant.now())
                            .build();
                    savedSlots.add(slotRepository.save(newSlot));
                }
            }
        }

        // Update total slots count in ParkingArea
        long totalSlots = slotRepository.countByParkingAreaId(id);
        area.setTotalSlots((int) totalSlots);
        parkingAreaRepository.save(area);

        return ResponseEntity.ok(savedSlots);
    }

    // PUT /api/parking/{id}/slots/{slotId}/status
    @PutMapping("/{id}/slots/{slotId}/status")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> updateSlotStatus(@PathVariable String id, @PathVariable String slotId, @RequestBody Map<String, String> request) {
        Optional<Slot> slotOpt = slotRepository.findById(slotId);
        if (slotOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Slot not found"));
        }

        Slot slot = slotOpt.get();
        String status = request.get("status");
        slot.setStatus(status);
        if ("empty".equalsIgnoreCase(status)) {
            slot.setCurrentBookingId(null);
        }
        slot.setUpdatedAt(Instant.now());
        Slot saved = slotRepository.save(slot);

        return ResponseEntity.ok(saved);
    }

    // PUT /api/parking/{id}/slots/{slotId}/free
    @PutMapping("/{id}/slots/{slotId}/free")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> freeSlot(@PathVariable String id, @PathVariable String slotId) {
        Optional<Slot> slotOpt = slotRepository.findById(slotId);
        if (slotOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Slot not found"));
        }

        Slot slot = slotOpt.get();

        if (slot.getCurrentBookingId() != null) {
            Optional<Booking> bookingOpt = bookingRepository.findById(slot.getCurrentBookingId());
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                booking.setStatus("completed");
                bookingRepository.save(booking);
            }
        }

        slot.setStatus("empty");
        slot.setCurrentBookingId(null);
        slot.setUpdatedAt(Instant.now());
        Slot saved = slotRepository.save(slot);

        return ResponseEntity.ok(Map.of("message", "Slot freed successfully", "slot", saved));
    }

    // DELETE /api/parking/{id}/slots/{slotId}
    @DeleteMapping("/{id}/slots/{slotId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> deleteSlot(@PathVariable String id, @PathVariable String slotId) {
        if (!slotRepository.existsById(slotId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Slot not found"));
        }

        slotRepository.deleteById(slotId);

        // Update total slots count in ParkingArea
        long totalSlots = slotRepository.countByParkingAreaId(id);
        Optional<ParkingArea> areaOpt = parkingAreaRepository.findById(id);
        if (areaOpt.isPresent()) {
            ParkingArea area = areaOpt.get();
            area.setTotalSlots((int) totalSlots);
            parkingAreaRepository.save(area);
        }

        return ResponseEntity.ok(Map.of("message", "Slot deleted successfully"));
    }
}
