import express from 'express';
import http from 'http';
import https from 'https';
import ParkingArea from '../models/ParkingArea.js';
import Slot from '../models/Slot.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/parking
// @desc    Create a new parking area (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, location, cctvUrl, pricePerHour, image } = req.body;

    const parkingArea = await ParkingArea.create({
      adminId: req.user._id,
      name,
      location,
      cctvUrl: cctvUrl || '',
      pricePerHour: pricePerHour || 50,
      image: image || ''
    });

    res.status(201).json(parkingArea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/parking
// @desc    Get all parking areas with available slot counts
router.get('/', async (req, res) => {
  try {
    const parkingAreas = await ParkingArea.find().populate('adminId', 'name email');
    
    // Get slot counts for each parking area
    const areasWithSlots = await Promise.all(
      parkingAreas.map(async (area) => {
        const totalSlots = await Slot.countDocuments({ parkingAreaId: area._id });
        const availableSlots = await Slot.countDocuments({ parkingAreaId: area._id, status: 'empty' });
        const occupiedSlots = await Slot.countDocuments({ parkingAreaId: area._id, status: 'occupied' });
        const reservedSlots = await Slot.countDocuments({ parkingAreaId: area._id, status: 'reserved' });
        
        return {
          ...area.toObject(),
          totalSlots,
          availableSlots,
          occupiedSlots,
          reservedSlots
        };
      })
    );

    res.json(areasWithSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/parking/my
// @desc    Get admin's own parking areas
router.get('/my', protect, adminOnly, async (req, res) => {
  try {
    const parkingAreas = await ParkingArea.find({ adminId: req.user._id });
    
    const areasWithSlots = await Promise.all(
      parkingAreas.map(async (area) => {
        const totalSlots = await Slot.countDocuments({ parkingAreaId: area._id });
        const availableSlots = await Slot.countDocuments({ parkingAreaId: area._id, status: 'empty' });
        const occupiedSlots = await Slot.countDocuments({ parkingAreaId: area._id, status: 'occupied' });
        const reservedSlots = await Slot.countDocuments({ parkingAreaId: area._id, status: 'reserved' });
        
        return {
          ...area.toObject(),
          totalSlots,
          availableSlots,
          occupiedSlots,
          reservedSlots
        };
      })
    );

    res.json(areasWithSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/parking/proxy-stream
// @desc    Proxy MJPEG stream to bypass CORS for AI detection
// IMPORTANT: This MUST be defined before /:id or Express will treat 'proxy-stream' as a Mongo ID
router.get('/proxy-stream', (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) return res.status(400).json({ message: 'URL is required' });

  const client = streamUrl.startsWith('https') ? https : http;
  
  const proxyReq = client.get(streamUrl, (stream) => {
    if (stream.statusCode !== 200) {
      return res.status(stream.statusCode).json({ message: 'Upstream stream error' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Type', stream.headers['content-type'] || 'image/jpeg');
    
    stream.on('error', (err) => {
      console.error('Upstream feed error:', err);
      res.end();
    });

    req.on('close', () => {
      proxyReq.destroy();
      stream.destroy();
    });

    stream.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.error('Proxy stream request error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to proxy stream' });
    }
  });
});

// @route   GET /api/parking/:id
// @desc    Get single parking area with all slots
router.get('/:id', async (req, res) => {
  try {
    const parkingArea = await ParkingArea.findById(req.params.id).populate('adminId', 'name email');
    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    const slots = await Slot.find({ parkingAreaId: req.params.id });

    res.json({ ...parkingArea.toObject(), slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/parking/:id
// @desc    Update parking area (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const parkingArea = await ParkingArea.findById(req.params.id);
    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    if (parkingArea.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this parking area' });
    }

    const updated = await ParkingArea.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/parking/:id/slots
// @desc    Add/update slots with coordinates (admin only)
router.post('/:id/slots', protect, adminOnly, async (req, res) => {
  try {
    const parkingArea = await ParkingArea.findById(req.params.id);
    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    if (parkingArea.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { slots } = req.body; // Array of { slotNumber, coordinates }

    const createdSlots = [];
    for (const slotData of slots) {
      const existingSlot = await Slot.findOne({
        parkingAreaId: req.params.id,
        slotNumber: slotData.slotNumber
      });

      if (existingSlot) {
        existingSlot.coordinates = slotData.coordinates;
        await existingSlot.save();
        createdSlots.push(existingSlot);
      } else {
        const newSlot = await Slot.create({
          parkingAreaId: req.params.id,
          slotNumber: slotData.slotNumber,
          coordinates: slotData.coordinates,
          status: 'empty'
        });
        createdSlots.push(newSlot);
      }
    }

    // Update total slots count
    const totalSlots = await Slot.countDocuments({ parkingAreaId: req.params.id });
    parkingArea.totalSlots = totalSlots;
    await parkingArea.save();

    res.json(createdSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/parking/:id/slots/:slotId/status
// @desc    Update slot status (admin - for marking occupied/empty)
router.put('/:id/slots/:slotId/status', protect, adminOnly, async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    slot.status = req.body.status;
    if (req.body.status === 'empty') {
      slot.currentBookingId = null;
    }
    await slot.save();

    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/parking/:id/slots/:slotId/free
// @desc    Free a reserved slot (admin only)
router.put('/:id/slots/:slotId/free', protect, adminOnly, async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // Update booking status to completed
    if (slot.currentBookingId) {
      const Booking = (await import('../models/Booking.js')).default;
      await Booking.findByIdAndUpdate(slot.currentBookingId, { status: 'completed' });
    }

    slot.status = 'empty';
    slot.currentBookingId = null;
    await slot.save();

    res.json({ message: 'Slot freed successfully', slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/parking/:id/slots/:slotId
// @desc    Delete a slot (admin only)
router.delete('/:id/slots/:slotId', protect, adminOnly, async (req, res) => {
  try {
    await Slot.findByIdAndDelete(req.params.slotId);
    
    const totalSlots = await Slot.countDocuments({ parkingAreaId: req.params.id });
    await ParkingArea.findByIdAndUpdate(req.params.id, { totalSlots });

    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
