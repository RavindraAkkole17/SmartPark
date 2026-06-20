import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SlotBooking from './SlotBooking';
import './User.css';

const ParkingView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parkingArea, setParkingArea] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParkingArea();
    const interval = setInterval(fetchParkingArea, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchParkingArea = async () => {
    try {
      const res = await axios.get(`/api/parking/${id}`);
      setParkingArea(res.data);
      const sorted = (res.data.slots || []).sort((a, b) => {
        const nA = parseInt(a.slotNumber.replace(/\D/g, '')) || 0;
        const nB = parseInt(b.slotNumber.replace(/\D/g, '')) || 0;
        return nA - nB;
      });
      setSlots(sorted);
    } catch (err) {
      console.error('Failed to fetch parking area:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'empty') setSelectedSlot(slot);
  };

  const openNavigation = () => {
    if (parkingArea?.location) {
      const { lat, lng } = parkingArea.location;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  if (loading && !parkingArea) {
    return (
      <div className="user-loading">
        <div className="loader-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading parking view</p>
      </div>
    );
  }

  if (!parkingArea) return <div className="user-loading"><p>Parking area not found.</p></div>;

  const available = slots.filter(s => s.status === 'empty').length;
  const occupied  = slots.filter(s => s.status === 'occupied').length;

  return (
    <div className="parking-view">

      {/* Carbon strip header */}
      <div className="pv-strip">
        <div className="pv-strip-inner">
          <button className="pv-back" onClick={() => navigate('/dashboard')}>
            ← Back to Parking Areas
          </button>
          <h1 className="pv-title">{parkingArea.name}</h1>
          <p className="pv-location">{parkingArea.location?.address || 'Location not specified'}</p>

          <div className="pv-meta-row">
            <div className="pv-meta-item">
              <span className="pv-meta-label">Price</span>
              <span className="pv-meta-value">₹{parkingArea.pricePerHour}/hr</span>
            </div>
            <div className="pv-meta-item">
              <span className="pv-meta-label">Available</span>
              <span className="pv-meta-value">{available}</span>
            </div>
            <div className="pv-meta-item">
              <span className="pv-meta-label">Occupied</span>
              <span className="pv-meta-value">{occupied}</span>
            </div>
            <div className="pv-meta-item">
              <span className="pv-meta-label">Total</span>
              <span className="pv-meta-value">{slots.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slot grid */}
      <div className="pv-body">
        <div className="slot-legend">
          <div className="legend-item">
            <span className="legend-dot empty"></span>
            <span>Empty — click to select</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--color-carbon)' }}></span>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot occupied"></span>
            <span>Occupied</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot reserved"></span>
            <span>Reserved</span>
          </div>
        </div>

        <div className="slot-grid">
          {slots.map(slot => {
            const isSelected = selectedSlot?._id === slot._id;
            let cls = slot.status;
            if (isSelected) cls = 'selected';
            return (
              <button
                key={slot._id}
                className={`slot-cell ${cls}`}
                onClick={() => handleSlotClick(slot)}
                disabled={slot.status !== 'empty' && !isSelected}
                title={`Slot ${slot.slotNumber} — ${slot.status}`}
              >
                {slot.slotNumber}
              </button>
            );
          })}
        </div>

        <div className="pv-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setShowBooking(true)}
            disabled={!selectedSlot}
          >
            {selectedSlot
              ? `Book Slot ${selectedSlot.slotNumber} →`
              : 'Select a slot above'}
          </button>
          <button className="btn btn-secondary" onClick={openNavigation}>
            Navigate to Parking
          </button>
        </div>
      </div>

      {showBooking && selectedSlot && (
        <SlotBooking
          slot={selectedSlot}
          parkingArea={parkingArea}
          onClose={() => setShowBooking(false)}
          onComplete={() => {
            setShowBooking(false);
            setSelectedSlot(null);
            fetchParkingArea();
          }}
        />
      )}
    </div>
  );
};

export default ParkingView;
