import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingAreaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingArea',
    required: true
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  paymentId: {
    type: String,
    default: ''
  },
  orderId: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Booking', bookingSchema);
