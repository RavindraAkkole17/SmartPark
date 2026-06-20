package com.smartpark.backend.repository;

import com.smartpark.backend.model.Slot;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface SlotRepository extends MongoRepository<Slot, String> {
    List<Slot> findByParkingAreaId(String parkingAreaId);
    long countByParkingAreaId(String parkingAreaId);
    long countByParkingAreaIdAndStatus(String parkingAreaId, String status);
    Optional<Slot> findByParkingAreaIdAndSlotNumber(String parkingAreaId, String slotNumber);
}
