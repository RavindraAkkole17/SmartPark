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
    // Auto-refresh slots every 3 seconds to get live AI updates from admin
    const interval = setInterval(fetchParkingArea, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchParkingArea = async () => {
    try {
      const res = await axios.get(`/api/parking/${id}`);
      setParkingArea(res.data);
      
      // Sort slots by slotNumber (e.g., S1, S2, S3)
      const sortedSlots = (res.data.slots || []).sort((a, b) => {
        const numA = parseInt(a.slotNumber.replace(/[^0-9]/g, '')) || 0;
        const numB = parseInt(b.slotNumber.replace(/[^0-9]/g, '')) || 0;
        return numA - numB;
      });
      setSlots(sortedSlots);
    } catch (error) {
      console.error('Failed to fetch parking area:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'empty') {
      setSelectedSlot(slot);
    }
  };

  const openNavigation = () => {
    if (parkingArea?.location) {
      const { lat, lng } = parkingArea.location;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  if (loading && !parkingArea) {
    return <div className="user-loading"><p>Loading parking view...</p></div>;
  }

  if (!parkingArea) {
    return <div className="user-loading"><p>Parking area not found</p></div>;
  }

  const availableSlots = slots.filter(s => s.status === 'empty').length;

  return (
    <div className="parking-view-page-clean">
      <div className="pv-clean-container">
        {/* Header matching referral image */}
        <div className="pv-clean-header">
          <button className="pv-back-icon" onClick={() => navigate('/dashboard')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="pv-clean-content">
          <h1 className="pv-clean-title">{parkingArea.name}</h1>
          <p className="pv-clean-meta">Owner: {parkingArea.ownerName || 'Admin'}</p>
          <p className="pv-clean-meta">Available Slots: {availableSlots}</p>

          <div className="pv-date-selector">
            <button className="btn-select-date" onClick={() => setShowBooking(true)} disabled={!selectedSlot}>
              SELECT DATE
            </button>
            <span className="pv-date-display">{new Date().toISOString().split('T')[0]}</span>
          </div>

          <div className="pv-legend">
            <div className="legend-item">
              <div className="legend-box empty"></div>
              <span>Empty</span>
            </div>
            <div className="legend-item">
              <div className="legend-box selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="legend-box occupied"></div>
              <span>Occupied</span>
            </div>
            <div className="legend-item">
              <div className="legend-box reserved"></div>
              <span>Reserved</span>
            </div>
          </div>

          {/* Clean Grid of Slots */}
          <div className="pv-slots-grid">
            {slots.map(slot => {
              const isSelected = selectedSlot?._id === slot._id;
              let slotClass = '';
              if (isSelected) slotClass = 'selected';
              else if (slot.status === 'empty') slotClass = 'empty';
              else if (slot.status === 'occupied') slotClass = 'occupied';
              else slotClass = 'reserved';

              return (
                <button
                  key={slot._id}
                  className={`pv-slot-box ${slotClass}`}
                  onClick={() => handleSlotClick(slot)}
                  disabled={slot.status !== 'empty' && !isSelected}
                >
                  {slot.slotNumber}
                </button>
              );
            })}
          </div>

          <div className="pv-action-buttons">
            <button 
              className="btn btn-prebook" 
              onClick={() => setShowBooking(true)}
              disabled={!selectedSlot}
            >
              Pre-Book Slot
            </button>
            <button 
              className="btn btn-navigate" 
              onClick={openNavigation}
            >
              Navigate to Parking
            </button>
          </div>
        </div>

        {/* Slot Booking Modal */}
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
    </div>
  );
};

export default ParkingView;
