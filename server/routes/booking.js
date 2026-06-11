import express from 'express';
import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import ParkingArea from '../models/ParkingArea.js';
import { protect, adminOnly, userOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/booking
// @desc    Create a new booking (user only)
router.post('/', protect, userOnly, async (req, res) => {
  try {
    const { parkingAreaId, slotId, bookingDate, paymentId, orderId, amount } = req.body;

    // Check if slot is available
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.status === 'reserved') {
      return res.status(400).json({ message: 'Slot is already reserved' });
    }

    // Check if slot is already booked for the same date
    const existingBooking = await Booking.findOne({
      slotId,
      bookingDate: new Date(bookingDate),
      status: 'confirmed'
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Slot is already booked for this date' });
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      parkingAreaId,
      slotId,
      bookingDate: new Date(bookingDate),
      paymentId: paymentId || '',
      orderId: orderId || '',
      amount,
      status: 'confirmed'
    });

    // Update slot status to reserved
    slot.status = 'reserved';
    slot.currentBookingId = booking._id;
    await slot.save();

    // Populate booking with slot and parking area details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('slotId', 'slotNumber')
      .populate('parkingAreaId', 'name location')
      .populate('userId', 'name email phone');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/booking/my
// @desc    Get current user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('slotId', 'slotNumber')
      .populate('parkingAreaId', 'name location pricePerHour')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/booking/parking/:parkingId
// @desc    Get all bookings for a parking area (admin only)
router.get('/parking/:parkingId', protect, adminOnly, async (req, res) => {
  try {
    // Verify admin owns this parking area
    const parkingArea = await ParkingArea.findById(req.params.parkingId);
    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    if (parkingArea.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bookings = await Booking.find({ parkingAreaId: req.params.parkingId })
      .populate('userId', 'name email phone')
      .populate('slotId', 'slotNumber status')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/booking/:id
// @desc    Get single booking details
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('slotId', 'slotNumber')
      .populate('parkingAreaId', 'name location pricePerHour');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
