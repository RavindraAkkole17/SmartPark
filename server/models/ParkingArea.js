import mongoose from 'mongoose';

const parkingAreaSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Parking name is required'],
    trim: true
  },
  location: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  cctvUrl: {
    type: String,
    default: ''
  },
  totalSlots: {
    type: Number,
    default: 0
  },
  pricePerHour: {
    type: Number,
    required: true,
    default: 50
  },
  image: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ParkingArea', parkingAreaSchema);
