package com.smartpark.backend.repository;

import com.smartpark.backend.model.ParkingArea;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ParkingAreaRepository extends MongoRepository<ParkingArea, String> {
    List<ParkingArea> findByAdminId(String adminId);
}
