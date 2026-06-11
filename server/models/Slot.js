import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  parkingAreaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingArea',
    required: true
  },
  slotNumber: {
    type: String,
    required: true
  },
  coordinates: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['empty', 'occupied', 'reserved'],
    default: 'empty'
  },
  currentBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

slotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Slot', slotSchema);
